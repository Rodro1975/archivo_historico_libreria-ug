"use client";

import { useEffect, useState, useCallback } from "react"; // Importar useCallback
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
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";
import html2canvas from "html2canvas";

export default function RegistroUsuariosPage() {
  const [data, setData] = useState([]);
  const [rol, setRol] = useState(null);

  // Memoizar cargarDatos
  const cargarDatos = useCallback(async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("fecha_creacion");

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const agrupado = {};
    data.forEach(({ fecha_creacion }) => {
      if (!fecha_creacion) return;
      const year = new Date(fecha_creacion).getFullYear();
      agrupado[year] = (agrupado[year] || 0) + 1;
    });

    const datosFormateados = Object.entries(agrupado).map(
      ([year, cantidad]) => ({
        year,
        cantidad,
      })
    );

    setData(datosFormateados);
  }, []);

  // Memoizar verificarRol
  const verificarRol = useCallback(async () => {
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
  }, [cargarDatos]);

  // Actualizar useEffect con dependencias correctas
  useEffect(() => {
    verificarRol();
  }, [verificarRol]);

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-usuarios-registro");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "usuarios_por_anio.png";
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
          Registro de usuarios por año
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-usuarios-registro">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#facc15" />
              <YAxis stroke="#facc15" allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="cantidad" fill="#38bdf8" />
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
