"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AutoresVigencia() {
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
      .select("vigencia");

    if (error) {
      toastError("Error al cargar autores");
      return;
    }

    const activos = autores.filter((a) => a.vigencia === true).length;
    const inactivos = autores.filter((a) => a.vigencia === false).length;

    setData([
      { estado: "Activos", cantidad: activos },
      { estado: "Inactivos", cantidad: inactivos },
    ]);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-vigencia");
    if (!chart) return;
    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "autores_por_vigencia.png";
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
          Vigencia de Autores
        </h1>
      </div>

      {data.length > 0 ? (
        <div id="grafica-vigencia">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 60, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#facc15" />
              <XAxis type="number" stroke="#facc15" />
              <YAxis type="category" dataKey="estado" stroke="#facc15" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#facc15" }} />
              <Bar dataKey="cantidad" fill="#facc15" name="Cantidad" />
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
