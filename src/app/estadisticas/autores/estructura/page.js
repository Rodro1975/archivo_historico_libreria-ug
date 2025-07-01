"use client";

import { useEffect, useState } from "react";
import WorkBar from "@/components/WorkBar";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import html2canvas from "html2canvas";
import supabase from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

export default function EstructuraAutores() {
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
    const { data, error } = await supabase.rpc("autores_por_estructura");

    if (error) {
      toast.error("Error al cargar datos");
      return;
    }

    // Agrupar por dependencia
    const agrupado = {};
    data.forEach((item) => {
      if (!agrupado[item.dependencia]) agrupado[item.dependencia] = {};
      agrupado[item.dependencia][item.unidad_academica] = item.cantidad;
    });

    const unidades = [...new Set(data.map((item) => item.unidad_academica))];

    const datosFormateados = Object.entries(agrupado).map(
      ([dependencia, unidadesObj]) => {
        const row = { name: dependencia };
        unidades.forEach((ua) => {
          row[ua] = unidadesObj[ua] || 0;
        });
        return row;
      }
    );

    setData({ datos: datosFormateados, unidades });
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-estructura");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "estructura_autores.png";
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
          Autores por Dependencia y Unidad Académica
        </h1>
      </div>
      {data?.datos?.length > 0 ? (
        <div id="grafica-estructura">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data.datos}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 60, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#facc15" />
              <YAxis dataKey="name" type="category" stroke="#facc15" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              {data.unidades.map((ua, index) => (
                <Bar
                  key={ua}
                  dataKey={ua}
                  stackId="a"
                  fill={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                />
              ))}
            </BarChart>
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
