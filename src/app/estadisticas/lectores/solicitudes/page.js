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
} from "recharts";

export default function SolicitudesPorTipo() {
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
    const { data, error } = await supabase.from("solicitudes").select("tipo");

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const conteo = {};
    data.forEach((s) => {
      conteo[s.tipo] = (conteo[s.tipo] || 0) + 1;
    });

    const datos = Object.entries(conteo).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }));

    setData(datos);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-solicitudes-tipo");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "solicitudes_por_tipo.png";
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
          Solicitud por Tipo
        </h1>
      </div>

      {data.length > 0 ? (
        <div id="grafica-solicitudes-tipo">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#facc15" />
              <XAxis dataKey="tipo" tick={{ fill: "#facc15" }} />
              <YAxis tick={{ fill: "#facc15" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-white text-center">Cargando datos...</p>
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
