"use client";

import { useEffect, useState, useRef } from "react";
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
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";

export default function EstadisticasLibros() {
  const [data, setData] = useState([]);
  const [rol, setRol] = useState(null);
  const graficaRef = useRef(null);
  // Verifica que el usuario tenga rol de Editor o Administrador
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
    const { data: libros, error } = await supabase
      .from("libros")
      .select("anioPublicacion");

    if (error) {
      toastError("Error al cargar libros");
      return;
    }

    const conteo = {};
    libros.forEach((libro) => {
      const anio =
        libro.anioPublicacion != null
          ? String(libro.anioPublicacion)
          : "Desconocido";
      conteo[anio] = (conteo[anio] || 0) + 1;
    });

    const datosFormateados = Object.entries(conteo)
      .map(([anio, cantidad]) => ({ anio, cantidad }))
      .sort((a, b) => {
        const ax = a.anio === "Desconocido";
        const bx = b.anio === "Desconocido";
        if (ax !== bx) return ax ? 1 : -1; // "Desconocido" al final
        return Number(a.anio) - Number(b.anio);
      });

    setData(datosFormateados);
  };

  const exportarImagen = async () => {
    const element = graficaRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const enlace = document.createElement("a");
    enlace.download = "grafica-libros-por-anio.png";
    enlace.href = canvas.toDataURL("image/png");
    enlace.click();
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
          Libros por Año de Publicación
        </h1>
      </div>
      <div ref={graficaRef}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="anio"
                stroke="#facc15"
                tick={{ fill: "#facc15", fontSize: 12 }}
              />
              <YAxis
                stroke="#facc15"
                tick={{ fill: "#facc15", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ color: "#facc15" }} />

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
          </ResponsiveContainer>
        ) : (
          <p className="text-white text-center">Cargando gráfico...</p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={exportarImagen}
          className="bg-blue text-yellow font-bold px-6 py-2 rounded-lg hover:scale-105 transition-all border border-yellow"
        >
          📷 Exportar como imagen
        </button>
      </div>
    </div>
  );
}
