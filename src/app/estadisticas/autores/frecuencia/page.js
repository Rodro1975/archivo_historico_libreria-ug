"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";

export default function AutoresFrecuencia() {
  const [data, setData] = useState([]);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const verificarRol = async () => {
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
      if (["Administrador", "Editor"].includes(usuario.role)) {
        cargarDatos();
      } else {
        toastError("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data: autores, error } = await supabase
      .from("autores")
      .select("nombre_completo");

    if (error) {
      toastError("Error al cargar autores");
      return;
    }

    const conteo = {};
    autores.forEach((autor) => {
      const nombre = autor.nombre_completo?.trim() || "Sin nombre";
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    const datosFormateados = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ name: nombre, value: cantidad }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    setData(datosFormateados);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-autores");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "autores_frecuentes.png";
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
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Autores con más publicaciones
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-autores" className="p-4">
          <BarChart width={800} height={400} data={data} layout="vertical">
            <XAxis type="number" stroke="#facc15" />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#facc15"
              width={200}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#facc15" }}
            />
            <Legend wrapperStyle={{ color: "#1e3a8a" }} />
            <Bar dataKey="value" fill="#facc15">
              <LabelList dataKey="value" position="right" fill="#1e3a8a" />
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#facc15" />
              ))}
            </Bar>
          </BarChart>
        </div>
      ) : (
        <p className="text-white text-center">Cargando gráfico...</p>
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
