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
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";
import html2canvas from "html2canvas";

export default function UsuariosPorRolPage() {
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
      if (["Administrador"].includes(usuario.role)) {
        cargarDatos();
      } else {
        toastError("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data, error } = await supabase.from("usuarios").select("role");

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const conteo = data.reduce((acc, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {});

    const formato = Object.entries(conteo).map(([rol, cantidad]) => ({
      name: rol,
      value: cantidad,
    }));

    setData(formato);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-usuarios-rol");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "usuarios_por_rol.png";
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
    <div className="p-6 max-w-4xl mx-auto">
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
          Usuarios por Rol
        </h1>
      </div>

      {data?.length > 0 ? (
        <div id="grafica-usuarios-rol">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={{ fill: "white" }}
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
