"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import html2canvas from "html2canvas";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

export default function PaginasLibros() {
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
        toast.error("No se pudo verificar el rol");
        return;
      }

      setRol(usuario.role);
      if (["Administrador", "Editor"].includes(usuario.role)) {
        cargarDatos();
      } else {
        toast.error("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data: libros, error } = await supabase
      .from("libros")
      .select("numeroPaginas");

    if (error) {
      toast.error("Error al cargar libros");
      return;
    }

    const intervalos = {
      "1-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "500+": 0,
    };

    libros.forEach((libro) => {
      const paginas = parseInt(libro.numeroPaginas);
      if (isNaN(paginas)) return;

      if (paginas <= 100) intervalos["1-100"]++;
      else if (paginas <= 200) intervalos["101-200"]++;
      else if (paginas <= 300) intervalos["201-300"]++;
      else if (paginas <= 400) intervalos["301-400"]++;
      else if (paginas <= 500) intervalos["401-500"]++;
      else intervalos["500+"]++;
    });

    const datosFormateados = Object.entries(intervalos).map(
      ([rango, cantidad]) => ({ rango, cantidad })
    );

    setData(datosFormateados);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-paginas");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "libros_por_rango_paginas.png";
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
      <Toaster position="top-right" toastOptions={toastStyle} />
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
          Distribución de Libros por Número de Páginas
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-paginas" className="overflow-x-auto">
          <BarChart width={600} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="rango"
              stroke="#facc15"
              tick={{ fill: "#facc15", fontSize: 12 }}
            />
            <YAxis stroke="#facc15" tick={{ fill: "#facc15", fontSize: 12 }} />
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
            <Bar dataKey="cantidad" fill="#facc15" stroke="#1e3a8a" />
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
