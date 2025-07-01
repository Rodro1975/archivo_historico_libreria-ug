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
import { toast, Toaster } from "react-hot-toast";
import supabase from "@/lib/supabase";
import html2canvas from "html2canvas";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function AutoresCreacionPage() {
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
        fetchData();
      } else {
        toast.error("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("autores")
      .select("id, fecha_creacion, vigencia");

    if (error) {
      toast.error("Error al cargar datos: " + error.message);
      return;
    }

    const grouped = {};

    data.forEach(({ fecha_creacion, vigencia }) => {
      if (!fecha_creacion) return;
      const year = new Date(fecha_creacion).getFullYear();
      const key = `${vigencia ? "Activos" : "Inactivos"} ${year}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });

    const formatted = Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));

    setData(formatted);
  }

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-creacion-autores");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "autores_por_creacion.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!rol)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Verificando permisos...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
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
          Autores por Año y Vigencia
        </h1>
      </div>

      {data.length > 0 ? (
        <div id="grafica-creacion-autores">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
