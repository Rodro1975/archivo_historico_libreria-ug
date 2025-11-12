"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";

const COLORS = [
  "#facc15", // dorado
  "#3b82f6", // azul claro (reemplaza gris claro)
  "#fb923c", // naranja
  "#eab308", // amarillo
  "#60a5fa", // azul más claro (opcional, puedes dejar el anterior)
  "#f97316", // naranja oscuro
  "#84cc16", // verde
  "#ef4444", // rojo
];

export default function FormatoLibros() {
  const [data, setData] = useState([]);
  const [rol, setRol] = useState(null);
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
  // Carga los datos de libros por formato
  const cargarDatos = async () => {
    const { data: libros, error } = await supabase
      .from("libros")
      .select("formato");

    if (error) {
      toastError("Error al cargar libros");
      return;
    }

    const conteo = {};
    libros.forEach((libro) => {
      // Normaliza el formato
      const formato =
        libro.formato?.trim() === "Electrónico"
          ? "Electrónico"
          : libro.formato?.trim() || "Desconocido";
      conteo[formato] = (conteo[formato] || 0) + 1;
    });

    const datosFormateados = Object.entries(conteo).map(
      ([formato, cantidad]) => ({
        name: formato,
        value: cantidad,
      })
    );

    setData(datosFormateados);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-formato");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "libros_por_formato.png";
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
          Libros por Formato de Publicación
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-formato">
          <div className="flex justify-center">
            <PieChart width={500} height={400}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
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
            </PieChart>
          </div>
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
