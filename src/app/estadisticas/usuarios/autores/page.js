"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast, Toaster } from "react-hot-toast";
import supabase from "@/lib/supabase";
import html2canvas from "html2canvas";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";

const COLORS = ["#22c55e", "#ef4444"];

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

export default function UsuariosEsAutorPage() {
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
      if (["Administrador"].includes(usuario.role)) {
        cargarDatos();
      } else {
        toast.error("Acceso denegado");
      }
    };

    verificarRol();
  }, []);

  const cargarDatos = async () => {
    const { data, error } = await supabase.from("usuarios").select("es_autor");

    if (error) {
      toast.error("Error al cargar datos");
      return;
    }

    const conteo = { autor: 0, no_autor: 0 };

    data.forEach(({ es_autor }) => {
      if (es_autor) conteo.autor++;
      else conteo.no_autor++;
    });

    setData([
      { name: "Autores", value: conteo.autor },
      { name: "No autores", value: conteo.no_autor },
    ]);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-usuarios-esautor");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "usuarios_por_autoria.png";
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
          Usuarios con Rol de Autor
        </h1>
      </div>
      <div id="grafica-usuarios-esautor" className="w-full h-96">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
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
