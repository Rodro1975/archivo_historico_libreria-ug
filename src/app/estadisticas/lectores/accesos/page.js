"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import WorkBar from "@/components/WorkBar";
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

export default function AccesosLectores() {
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
      if (usuario.role === "Administrador") {
        cargarDatos();
      } else {
        toastError("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data, error } = await supabase
      .from("lectores")
      .select("ultimo_acceso")
      .not("ultimo_acceso", "is", null);

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const agrupado = {};
    data.forEach(({ ultimo_acceso }) => {
      const year = new Date(ultimo_acceso).getFullYear();
      if (!agrupado[year]) agrupado[year] = 0;
      agrupado[year]++;
    });

    const datosFormateados = Object.entries(agrupado).map(
      ([year, cantidad]) => ({ year, cantidad })
    );

    setData(datosFormateados);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-accesos");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "accesos_lectores.png";
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
          Últimos accesos de lectores por año
        </h1>
      </div>
      {data?.length > 0 ? (
        <div id="grafica-accesos">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 20, left: 60, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#facc15" allowDecimals={false} />
              <YAxis dataKey="year" type="category" stroke="#facc15" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="cantidad" fill="#60a5fa" name="Accesos" />
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
