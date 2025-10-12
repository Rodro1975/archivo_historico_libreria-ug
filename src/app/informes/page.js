"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import {
  FaBook,
  FaUsers,
  FaFileAlt,
  FaUserEdit,
  FaUsersCog,
  FaTools,
  FaUser,
} from "react-icons/fa";
import WorkBar from "@/components/WorkBar";

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
        toastError("No se pudo verificar el rol");
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
      icon: <FaBook size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Libros",
      descripcion: "Reportes visuales y detallados de publicaciones.",
      ruta: "/informes/libros",
    },
    {
      visible: true,
      icon: <FaUserEdit size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Autores",
      descripcion: "Consulta y analiza los autores registrados.",
      ruta: "/informes/autores",
    },
    {
      visible: true,
      icon: <FaFileAlt size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Unidades Academicas y Dependencias",
      descripcion:
        "Analiza libros registrados por dependencias o u. academicas.",
      ruta: "/informes/dependenciaAcademica",
    },
    {
      visible: true,
      icon: <FaUsersCog size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Autores más frecuentes",
      descripcion: "Analiza libros y su relación con los autores.",
      ruta: "/informes/autoresFrecuentes",
    },
    {
      visible: role === "Administrador",
      icon: <FaUsers size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Lectores",
      descripcion: "Listado y análisis de lectores del sistema.",
      ruta: "/informes/lectores",
    },
    {
      visible: role === "Administrador",
      icon: <FaFileAlt size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Solicitudes",
      descripcion: "Revisión de solicitudes realizadas por usuarios.",
      ruta: "/informes/solicitudes",
    },
    {
      visible: role === "Administrador",
      icon: <FaTools size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Solicitudes de Soporte",
      descripcion: "Revisión de solicitudes de soporte solicitadas.",
      ruta: "/informes/soporte",
    },
    {
      visible: role === "Administrador",
      icon: <FaUser size={56} className="text-blue drop-shadow-lg" />,
      titulo: "Informe de Usuarios",
      descripcion: "Revisión de solicitudes de soporte solicitadas.",
      ruta: "/informes/usuarios",
    },
  ];

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue text-xl">Verificando permisos...</p>
      </div>
    );
  }

  // Gradientes inline (no se purgan)
  const gradients = [
    "linear-gradient(135deg, #FACC15 0%, orange 50%, gold 100%)",
    "linear-gradient(135deg, gold 0%, orange 50%, #FACC15 100%)",
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <WorkBar />

      {/* Encabezado */}
      <div className="flex flex-col items-center justify-center mb-10">
        <Image
          src="/images/editorial-ug.png"
          alt="Logo UG"
          width={160}
          height={160}
          className="drop-shadow-lg mb-3"
        />
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Centro de Informes del Catálogo Histórico
        </h1>
        <p className="text-gray-300 text-base text-center max-w-xl mt-1 font-medium">
          Selecciona el tipo de informe que deseas generar.
          <br />
          Algunas opciones están disponibles solo para administradores.
        </p>
      </div>

      {/* CSS local */}
      <style jsx>{`
        :root {
          --hex-gap: clamp(12px, 2vw, 24px);
          --blue: #1e3a8a;
          --gold: gold;
        }

        .hex-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--hex-gap);
          justify-items: center;
          align-items: center;
        }
        @media (min-width: 640px) {
          .hex-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .hex-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1280px) {
          .hex-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .hex-card {
          position: relative;
          width: 100%;
          max-width: 260px;
          aspect-ratio: 280 / 260;
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
          overflow: hidden;
          padding: clamp(12px, 1.6vw, 18px);
          border: 4px solid var(--gold);
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.15);
          transition: transform 160ms ease, box-shadow 160ms ease,
            border-color 160ms ease, filter 160ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          outline: none;
          will-change: transform;
        }
        .hex-card:hover,
        .hex-card:focus-visible {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
          border-color: var(--blue);
          filter: saturate(1.05);
        }
        .hex-card:active {
          transform: translateY(-3px);
        }

        .hex-inner {
          display: grid;
          grid-template-rows: auto 1fr;
          align-items: center;
          justify-items: center;
          width: 100%;
          height: 100%;
          gap: clamp(6px, 1.1vw, 10px);
          text-align: center;
        }

        .hex-title {
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          line-height: 1.2;
        }

        .hex-desc {
          font-size: clamp(0.75rem, 1.05vw, 0.875rem);
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: rgba(30, 58, 138, 0.85);
          padding: 0 2px;
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .hex-desc {
            -webkit-line-clamp: 1;
          }
        }
        @media (max-width: 639px) {
          .hex-desc {
            display: none;
          }
        }
      `}</style>

      {/* Tarjetas (la tarjeta completa es “botón”) */}
      <div className="hex-grid">
        {tarjetas
          .filter((t) => t.visible)
          .map((t, i) => (
            <div
              key={i}
              className="hex-card"
              style={{ backgroundImage: gradients[i % 2] }}
              onClick={() => router.push(t.ruta)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push(t.ruta);
              }}
              role="link"
              tabIndex={0}
              aria-label={`Abrir ${t.titulo}`}
            >
              <div className="hex-inner">
                <div className="mb-1">{t.icon}</div>
                <div>
                  <h2 className="hex-title font-black text-blue mb-1">
                    {t.titulo}
                  </h2>
                  <p className="hex-desc">{t.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
