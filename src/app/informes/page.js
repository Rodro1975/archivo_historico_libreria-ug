// src/app/informes/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import supabase from "@/lib/supabase";
import {
  FaBook,
  FaUsers,
  FaFileAlt,
  FaChartPie,
  FaUserEdit,
} from "react-icons/fa";
import WorkBar from "@/components/WorkBar";

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

export default function InformesInicio() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getRole = async () => {
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

      if (error || !data) {
        toast.error("No se pudo verificar el rol");
        router.push("/dashboard");
        return;
      }

      setRole(data.role);
    };

    getRole();
  }, [router]);

  const tarjetas = [
    {
      visible: true,
      icon: <FaBook size={64} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Libros",
      descripcion: "Reportes visuales y detallados de publicaciones.",
      ruta: "/informes/libros",
      grad: "from-yellow via-orange to-gold",
    },
    {
      visible: true,
      icon: <FaUserEdit size={64} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Autores",
      descripcion: "Consulta y analiza los autores registrados.",
      ruta: "/informes/autores",
      grad: "from-gold via-orange to-yellow",
    },
    {
      visible: role === "Administrador",
      icon: <FaUsers size={64} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Lectores",
      descripcion: "Listado y análisis de lectores del sistema.",
      ruta: "/informes/lectores",
      grad: "from-yellow via-orange to-gold",
    },
    {
      visible: role === "Administrador",
      icon: <FaFileAlt size={64} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Solicitudes",
      descripcion: "Revisión de solicitudes realizadas por usuarios.",
      ruta: "/informes/solicitudes",
      grad: "from-gold via-orange to-yellow",
    },
    {
      visible: role === "Administrador",
      icon: <FaChartPie size={64} className="text-blue drop-shadow-lg" />,
      titulo: "Resumen General",
      descripcion: "Totales y estadísticas visuales del sistema.",
      ruta: "/informes/resumen",
      grad: "from-yellow via-orange to-gold",
    },
  ];

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue text-xl">Verificando permisos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" toastOptions={toastStyle} />
      <WorkBar />
      {/* Logo y título centrados */}
      <div className="flex flex-col items-center justify-center mb-10">
        <Image
          src="/images/editorial-ug.png"
          alt="Logo UG"
          width={160}
          height={160}
          className="drop-shadow-lg mb-3"
        />
        <h1 className="text-4xl font-black text-white text-center mb-2 tracking-wide">
          Centro de Informes del Archivo Histórico
        </h1>
        <p className="text-gray-300 text-base text-center max-w-xl mt-1 font-medium">
          Selecciona el tipo de informe que deseas generar.
          <br />
          Algunas opciones están disponibles solo para administradores.
        </p>
      </div>

      {/* Tarjetas hexagonales modernas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {tarjetas
          .filter((t) => t.visible)
          .map((t, i) => (
            <div
              key={i}
              onClick={() => router.push(t.ruta)}
              className={`
                relative cursor-pointer select-none
                group transition-transform transform hover:scale-105
                w-72 h-80 flex items-center justify-center
              `}
              style={{ perspective: "900px" }}
            >
              <div
                className={`
                  hexagon-bg bg-gradient-to-br ${t.grad}
                  border-4 border-gold shadow-xl
                  flex flex-col items-center justify-between
                  h-full w-full
                  transition-all duration-300
                  group-hover:shadow-2xl
                  group-hover:border-blue
                  group-hover:-translate-y-2
                  group-hover:ring-4 group-hover:ring-yellow
                  px-8 py-10
                  relative
                `}
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  minHeight: "320px",
                }}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="mb-2">{t.icon}</div>
                  <h2 className="text-xl font-black text-blue text-center mb-1 drop-shadow">
                    {t.titulo}
                  </h2>
                  <p className="text-blue/80 text-center font-medium text-sm line-clamp-2">
                    {t.descripcion}
                  </p>
                </div>
                <div className="flex justify-center w-full mt-3">
                  <span
                    className="bg-blue px-4 py-2 rounded-full text-gold text-base font-bold shadow-lg drop-shadow-lg transition-all group-hover:bg-gold group-hover:text-blue group-hover:shadow-yellow/40 group-hover:scale-105"
                    style={{
                      position: "relative",
                      bottom: "-10px",
                      boxShadow: "0 4px 18px 0 rgba(30,58,138,0.15)",
                    }}
                  >
                    Ver informe &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
      <style jsx>{`
        .border-gold {
          border-color: gold !important;
        }
        .group-hover\\:border-blue:hover {
          border-color: #1e3a8a !important;
        }
        .group-hover\\:ring-yellow:hover {
          box-shadow: 0 0 0 4px #facc15 !important;
        }
        .bg-gold {
          background-color: gold !important;
        }
        .from-gold {
          --tw-gradient-from: gold !important;
          --tw-gradient-stops: var(--tw-gradient-from),
            var(--tw-gradient-to, rgba(255, 215, 0, 0));
        }
        .to-gold {
          --tw-gradient-to: gold !important;
        }
        .from-yellow {
          --tw-gradient-from: #facc15 !important;
          --tw-gradient-stops: var(--tw-gradient-from),
            var(--tw-gradient-to, rgba(250, 204, 21, 0));
        }
        .to-yellow {
          --tw-gradient-to: #facc15 !important;
        }
        .via-orange {
          --tw-gradient-stops: var(--tw-gradient-from), orange,
            var(--tw-gradient-to, rgba(255, 165, 0, 0));
        }
        .bg-orange {
          background-color: orange !important;
        }
      `}</style>
    </div>
  );
}
