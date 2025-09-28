"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import WorkBar from "@/components/WorkBar";
import { FaChartBar } from "react-icons/fa";

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
        toastError("Acceso restringido");
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
          Estadísticas del Catálogo Histórico
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor y Admin pueden ver estadísticas de libros y autores */}
        <CardEstadistica
          titulo="📚 Libros por Año"
          descripcion="Distribución de libros registrados por año o década."
          ruta="/estadisticas/libros"
        />
        <CardEstadistica
          titulo="🌍 Libros por Idioma"
          descripcion="Distribución de libros según su idioma de publicación."
          ruta="/estadisticas/libros/idioma"
        />
        <CardEstadistica
          titulo="✍️ Libros por Tipo de Autoría"
          descripcion="Distribución de libros según el tipo de autoría registrada."
          ruta="/estadisticas/libros/autoria"
        />
        <CardEstadistica
          titulo="📦 Libros por Formato"
          descripcion="Distribución de libros por formato de publicación (PDF, impreso, etc)."
          ruta="/estadisticas/libros/formato"
        />
        <CardEstadistica
          titulo="📏 Libros por Número de Páginas"
          descripcion="Distribución por intervalos: 1-100, 101-200, etc."
          ruta="/estadisticas/libros/paginas"
        />
        <CardEstadistica
          titulo="🏫 Libros por RG/Campus/CNMS"
          descripcion="Cantidad de libros registrados por cada campus universitario."
          ruta="/estadisticas/libros/campus"
        />
        <CardEstadistica
          titulo="🏫 Libros por División / Secretaría / Escuela"
          descripcion="Agrupa los registros por división académica, secretarías o escuelas, con filtro por año."
          ruta="/estadisticas/libros/division"
        />

        <CardEstadistica
          titulo="✍️ Autores más frecuentes"
          descripcion="Autores con más publicaciones registradas."
          ruta="/estadisticas/autores/frecuencia"
        />
        <CardEstadistica
          titulo="🏛️ Autores por Estructura"
          descripcion="Distribución de autores por dependencia y unidad académica."
          ruta="/estadisticas/autores/estructura"
        />

        {rol === "Administrador" && (
          <>
            <CardEstadistica
              titulo="📅 Lectores por Año"
              descripcion="Cantidad de lectores registrados en cada año."
              ruta="/estadisticas/lectores/registro"
            />
            <CardEstadistica
              titulo="📥 Últimos accesos"
              descripcion="Lectores que accedieron por última vez por año."
              ruta="/estadisticas/lectores/accesos"
            />
            <CardEstadistica
              titulo="📑 Tipos de solicitud"
              descripcion="Clasificación de solicitudes hechas por los lectores."
              ruta="/estadisticas/lectores/solicitudes"
            />
            <CardEstadistica
              titulo="📊 Estado de solicitudes"
              descripcion="Distribución de solicitudes según su estado actual."
              ruta="/estadisticas/lectores/estados"
            />
            <CardEstadistica
              titulo="📅 Registro de usuarios por año"
              descripcion="Cantidad de usuarios registrados en el sistema por año."
              ruta="/estadisticas/usuarios/registro"
            />
            <CardEstadistica
              titulo="🖊️ Usuarios con rol de autor"
              descripcion="Comparativa entre usuarios que son autores y los que no."
              ruta="/estadisticas/usuarios/autores"
            />
            <CardEstadistica
              titulo="🆘 Soporte por Prioridad"
              descripcion="Cantidad de solicitudes de soporte según su nivel de prioridad."
              ruta="/estadisticas/soporte/prioridad"
            />
            <CardEstadistica
              titulo="⏱️ Solicitudes atendidas y tiempo de respuesta"
              descripcion="Cantidad de solicitudes resueltas por cada usuario y el tiempo promedio que tardaron."
              ruta="/estadisticas/soporte/atencion"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Componente tarjeta con redirección incluida
function CardEstadistica({ titulo, descripcion, ruta }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-6 border border-yellow shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <FaChartBar className="text-blue text-2xl" />
        <h2 className="text-xl font-bold text-blue">{titulo}</h2>
      </div>
      <p className="text-gray-600 mb-4">{descripcion}</p>
      <button
        onClick={() => router.push(ruta)}
        className="bg-orange text-gold font-bold px-4 py-2 rounded-lg border border-yellow hover:scale-105 transition-all"
      >
        Ver gráfica
      </button>
    </div>
  );
}
