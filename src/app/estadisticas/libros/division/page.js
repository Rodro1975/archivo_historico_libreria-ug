"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";
import html2canvas from "html2canvas";
import { toastError } from "@/lib/toastUtils";

// Nombre de la tabla de unidades académicas
const UA_TABLE = "unidades_academicas";

export default function LibrosPorDivSecEsc() {
  const [rol, setRol] = useState(null);
  const [anio, setAnio] = useState(""); // "" = todos
  const [groupBy, setGroupBy] = useState("division"); // division | secretaria | escuela
  const [rows, setRows] = useState([]); // libros crudos
  const [deps, setDeps] = useState([]); // dependencias
  const [uas, setUas] = useState([]); // unidades academicas
  const chartRef = useRef(null);

  // --- Auth + carga inicial
  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!usuario) {
        toastError("No se pudo verificar el rol");
        return;
      }

      setRol(usuario.role);
      if (!["Administrador", "Editor"].includes(usuario.role)) {
        toastError("Acceso denegado");
        return;
      }

      // Cargar datos necesarios
      const [librosRes, depsRes, uasRes] = await Promise.all([
        supabase
          .from("libros")
          .select(
            "anioPublicacion, division, dependencia_id, unidad_academica_id"
          ),
        supabase.from("dependencias").select("id, nombre, tipo"),
        supabase.from(UA_TABLE).select("id, nombre"),
      ]);

      if (librosRes.error) toastError("Error al cargar libros");
      if (depsRes.error) toastError("Error al cargar dependencias");
      if (uasRes.error) toastError("Error al cargar unidades académicas");

      setRows(librosRes.data || []);
      setDeps(depsRes.data || []);
      setUas(uasRes.data || []);
    };

    run();
  }, []);

  // --- Años disponibles (derivados de libros)
  const anios = useMemo(() => {
    const bag = new Set();
    for (const r of rows) {
      const a = r?.anioPublicacion;
      if (a != null && a !== "") bag.add(String(a));
    }
    return [...bag].sort((a, b) => Number(b) - Number(a));
  }, [rows]);

  // --- Agrupación
  const data = useMemo(() => {
    // Filtro por año (si aplica)
    const filtrados = anio
      ? rows.filter((r) => String(r?.anioPublicacion ?? "") === String(anio))
      : rows;

    const add = (map, key) => {
      const k = key?.trim() || "Sin dato";
      map.set(k, (map.get(k) || 0) + 1);
    };

    const conteo = new Map();

    if (groupBy === "division") {
      for (const r of filtrados) add(conteo, r.division);
    } else if (groupBy === "secretaria") {
      // Solo dependencias cuyo tipo incluye “Secretaría”
      const depById = new Map(deps.map((d) => [d.id, d]));
      for (const r of filtrados) {
        const dep = depById.get(r.dependencia_id);
        if (dep && /secretar/i.test(dep.tipo || "")) {
          add(conteo, dep.nombre);
        } else {
          add(conteo, "Sin Secretaría");
        }
      }
    } else if (groupBy === "escuela") {
      const uaById = new Map(uas.map((u) => [u.id, u]));
      for (const r of filtrados) {
        const ua = uaById.get(r.unidad_academica_id);
        add(conteo, ua?.nombre || "Sin escuela");
      }
    }

    // Arreglo para Recharts
    const arr = [...conteo.entries()].map(([label, cantidad]) => ({
      label,
      cantidad,
    }));

    // Ordenar por cantidad desc
    arr.sort((a, b) => b.cantidad - a.cantidad);

    return arr;
  }, [rows, deps, uas, anio, groupBy]);

  const exportarImagen = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "libros-por-division-secretaria-escuela.png";
    link.href = canvas.toDataURL();
    link.click();
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
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-6">
          Libros por División / Secretaría / Escuela
        </h1>

        {/* Controles */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {/* Agrupar por */}
          <label className="text-white text-sm">
            Agrupar por:{" "}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="ml-2 rounded-md bg-blue-900/60 text-blue border border-yellow px-2 py-1"
            >
              <option value="division">División</option>
              <option value="secretaria">Secretaría</option>
              <option value="escuela">Escuela</option>
            </select>
          </label>

          {/* Año */}
          <label className="text-white text-sm">
            Año:{" "}
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="ml-2 rounded-md bg-blue-900/60 text-blue border border-yellow px-2 py-1"
            >
              <option value="">Todos</option>
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Gráfica */}
      <div ref={chartRef}>
        {data.length ? (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 12 }}
                interval={0}
                height={70}
              />
              <YAxis
                stroke="#ffffff"
                tick={{ fill: "#ffffff", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e3a8a",
                  color: "#fff",
                  borderColor: "#facc15",
                }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#facc15" }}
              />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Bar
                dataKey="cantidad"
                name="Libros"
                fill="#facc15"
                stroke="#1e3a8a"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white text-center">Cargando gráfico...</p>
        )}
      </div>
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
