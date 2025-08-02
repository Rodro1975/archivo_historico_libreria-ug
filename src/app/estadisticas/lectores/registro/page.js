"use client";

import { useEffect, useState } from "react";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import html2canvas from "html2canvas";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function RegistroLectores() {
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
      if (usuario.role === "Administrador") {
        cargarDatos();
      } else {
        toastError("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data, error } = await supabase.from("lectores").select("creado_en");

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const conteo = {};
    data.forEach(({ creado_en }) => {
      if (!creado_en) return;
      const year = new Date(creado_en).getFullYear();
      conteo[year] = (conteo[year] || 0) + 1;
    });

    const formateado = Object.entries(conteo).map(([year, cantidad]) => ({
      year,
      Lectores: cantidad,
    }));

    setData(formateado);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-lectores-registro");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "lectores_por_registro.png";
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
          Lectores registrados por año
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-lectores-registro">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#facc15" />
              <XAxis dataKey="year" tick={{ fill: "#facc15" }} />
              <YAxis tick={{ fill: "#facc15" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Lectores" fill="#60a5fa" />
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
