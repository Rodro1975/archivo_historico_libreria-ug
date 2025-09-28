"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";

const NIVEL_LABEL = { rg: "RG", campus: "Campus", cnms: "CNMS" };
// Mapeo a columnas existentes en tu tabla `libros`
const NIVEL_TO_FIELD = {
  rg: "division",
  campus: "campus",
  cnms: "departamento",
};

export default function LibrosPorRgCampusCnms() {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controles
  const [nivel, setNivel] = useState("campus"); // 'rg' | 'campus' | 'cnms'
  const [anio, setAnio] = useState("todos"); // 'todos' | 2023 | 2024 ...

  // Datos crudos
  const [raw, setRaw] = useState([]); // [{ division, campus, departamento, anioPublicacion }]

  // Años disponibles (a partir de anioPublicacion)
  const years = useMemo(() => {
    const bag = new Set();
    for (const r of raw) {
      if (r.anioPublicacion) bag.add(Number(r.anioPublicacion));
    }
    return Array.from(bag).sort((a, b) => a - b);
  }, [raw]);

  // Agregado para la gráfica
  const data = useMemo(() => {
    if (!raw.length) return [];
    const field = NIVEL_TO_FIELD[nivel]; // columna real
    const counts = new Map();

    for (const r of raw) {
      if (anio !== "todos" && Number(r.anioPublicacion) !== Number(anio))
        continue;
      const kRaw = (r[field] ?? "").toString().trim();
      const k = kRaw || "Desconocido";
      counts.set(k, (counts.get(k) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([grupo, cantidad]) => ({ grupo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [raw, nivel, anio]);

  useEffect(() => {
    const verificarRolYCargar = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        toastError("Debes iniciar sesión");
        return;
      }

      const { data: usuario, error: roleErr } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleErr || !usuario) {
        setLoading(false);
        toastError("No se pudo verificar el rol");
        return;
      }

      setRol(usuario.role);
      if (!["Administrador", "Editor"].includes(usuario.role)) {
        setLoading(false);
        toastError("Acceso denegado");
        return;
      }

      // 🔹 Trae SOLO columnas existentes en tu tabla
      const { data: libros, error } = await supabase
        .from("libros")
        .select("division, campus, departamento, anioPublicacion");

      if (error) {
        toastError("Error al cargar libros");
        setLoading(false);
        return;
      }

      setRaw(libros || []);
      setLoading(false);
    };

    verificarRolYCargar();
  }, []);

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-rg-campus-cnms");
    if (!chart) return;
    const canvas = await html2canvas(chart);
    const selYear = anio === "todos" ? "todos" : anio;
    const file = `Libros por ${NIVEL_LABEL[nivel]}${
      selYear !== "todos" ? ` (${selYear})` : ""
    }.png`;
    const link = document.createElement("a");
    link.download = file;
    link.href = canvas.toDataURL();
    link.click();
    toastSuccess("Imagen exportada");
  };

  if (!rol) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Verificando permisos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <WorkBar />

      <div className="flex flex-col items-center justify-center mb-8">
        <Image
          src="/images/editorial-ug.png"
          alt="Editorial UG"
          width={160}
          height={160}
          className="mb-2"
        />
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-4">
          Libros por RG/Campus/CNMS
        </h1>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <label className="text-sm text-gray-100">
            Nivel:&nbsp;
            <select
              className="rounded bg-white text-blue px-2 py-1 border border-blue"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
            >
              <option value="rg">RG (division)</option>
              <option value="campus">Campus</option>
              <option value="cnms">CNMS (departamento)</option>
            </select>
          </label>

          <label className="text-sm text-gray-100">
            Año:&nbsp;
            <select
              className="rounded bg-white text-blue px-2 py-1 border border-blue"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            >
              <option value="todos">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-white text-center">Cargando gráfico...</p>
      ) : data.length > 0 ? (
        <div id="grafica-rg-campus-cnms">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={data} key={`${nivel}-${anio}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="grupo"
                stroke="#1E3A8A" // azul
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
              />
              <YAxis
                stroke="#1E3A8A" // azul
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  color: "#111827",
                  borderColor: "#1E3A8A",
                }}
                itemStyle={{ color: "#111827" }} // gris-900
                labelStyle={{ color: "#1F2937" }} // gris-800
                formatter={(v) => [v, "Libros"]}
              />
              <Legend
                wrapperStyle={{ color: "#1F2937" }} // gris-800
              />
              <Bar
                dataKey="cantidad"
                name="Libros"
                fill="#facc15"
                stroke="#1E3A8A"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-white text-center">
          No hay datos para los filtros seleccionados.
        </p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={exportarImagen}
          className="bg-orange text-gold font-bold px-6 py-2 rounded-lg hover:scale-105 transition-all border border-yellow"
        >
          📷 Exportar como imagen
        </button>
      </div>
    </div>
  );
}
