"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import WorkBar from "@/components/WorkBar";
import { FaChartBar } from "react-icons/fa";

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

export default function EstadisticasPage() {
  const router = useRouter();
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarAcceso = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data || !["Administrador", "Editor"].includes(data.role)) {
        toast.error("Acceso restringido");
        router.push("/dashboard");
        return;
      }

      setRol(data.role);
      setLoading(false);
    };

    verificarAcceso();
  }, [router]);

  if (loading || !rol) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue text-xl">Verificando permisos...</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-white text-center">
          Estadísticas del Archivo Histórico
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor y Admin pueden ver estadísticas de libros y autores */}
        <CardEstadistica
          titulo="📚 Libros por Año"
          descripcion="Distribución de libros registrados por año o década."
        />
        <CardEstadistica
          titulo="✍️ Autores más frecuentes"
          descripcion="Autores con más publicaciones registradas."
        />

        {rol === "Administrador" && (
          <>
            <CardEstadistica
              titulo="👤 Lectores por Unidad Académica"
              descripcion="Cantidad de lectores registrados por facultad o dependencia."
            />
            <CardEstadistica
              titulo="📥 Estado de Solicitudes"
              descripcion="Resumen de solicitudes: pendientes, aprobadas, rechazadas."
            />
            <CardEstadistica
              titulo="🧑‍💻 Usuarios registrados"
              descripcion="Total de usuarios del sistema por rol."
            />
            <CardEstadistica
              titulo="🧾 Libros por Dependencia"
              descripcion="Cantidad de libros clasificados por área o facultad."
            />
          </>
        )}
      </div>
    </div>
  );
}

function CardEstadistica({ titulo, descripcion }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-yellow shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <FaChartBar className="text-blue text-2xl" />
        <h2 className="text-xl font-bold text-blue">{titulo}</h2>
      </div>
      <p className="text-gray-600 mb-4">{descripcion}</p>
      <button className="bg-orange text-gold font-bold px-4 py-2 rounded-lg border border-yellow hover:scale-105 transition-all">
        Ver gráfica
      </button>
    </div>
  );
}
