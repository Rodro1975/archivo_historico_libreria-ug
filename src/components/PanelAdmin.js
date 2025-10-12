//components/PanelAdmin.js
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PanelAdmin = () => {
  const router = useRouter();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue font-bold mb-4">
        Panel de Administración
      </h1>

      {/* Layout responsive sin scroll: hexágonos con tamaño fluido */}
      <style jsx>{`
        :root {
          --hex-gap: clamp(10px, 2vw, 20px);
        }

        /* Grilla con columnas fijas por breakpoint (nunca 1 col en medianas) */
        .hex-grid {
          display: grid;
          grid-template-columns: 1fr; /* xs */
          gap: var(--hex-gap);
          justify-items: center;
          align-items: center;
        }
        @media (min-width: 640px) {
          /* sm */
          .hex-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          /* lg */
          .hex-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1280px) {
          /* xl */
          .hex-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Tarjeta hex: tamaño consistente, contenido no expande */
        .hexagon {
          position: relative;
          width: 100%;
          max-width: 240px; /* tope para uniformidad */
          aspect-ratio: 280 / 260; /* mantiene proporción */
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
          display: flex;
          align-items: center;
          padding: clamp(12px, 1.6vw, 20px);
          overflow: hidden; /* evita que el contenido crezca el hex */
        }

        .hex-content {
          display: flex;
          align-items: center;
          gap: clamp(8px, 1.2vw, 16px);
          text-align: left;
          width: 100%;
        }

        .hex-title {
          font-size: clamp(1rem, 1.6vw, 1.15rem);
          line-height: 1.2;
        }

        .hex-desc {
          font-size: clamp(0.75rem, 1.1vw, 0.875rem);
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2; /* máx 2 líneas en desktop */
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .hex-icon {
          width: clamp(48px, 6vw, 70px);
          height: auto;
          flex-shrink: 0;
        }

        /* Medias: 2 cols, párrafo a 1 línea (menos altura) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .hex-desc {
            -webkit-line-clamp: 1;
          }
        }

        /* Móviles: ocultar párrafo (ya lo hacías y funciona bien) */
        @media (max-width: 639px) {
          .hex-desc {
            display: none;
          }
        }
      `}</style>

      {/* Contenedor de tarjetas (grid) */}
      <div className="hex-grid">
        {/* Autores */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Autores")}
        >
          <div className="hex-content">
            <Image
              src="/images/autores.png"
              alt="Gestión de Autores"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <Link href="/mostrarAutores">
                <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
                  Autores
                </h2>
              </Link>
              <p className="hex-desc text-blue">
                Administra los Autores y sus publicaciones del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Informes */}
        <div
          className="hexagon bg-gradient-to-l from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => router.push("/informes")}
        >
          <div className="hex-content">
            <Image
              src="/images/informe.png"
              alt="Generación de Informes"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
                Informes
              </h2>
              <p className="hex-desc text-blue">
                Genera informes detallados del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Libros */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Libros")}
        >
          <div className="hex-content">
            <Image
              src="/images/libro.png"
              alt="Gestión de Libros"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <Link href="/mostrarLibros">
                <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
                  Libros
                </h2>
              </Link>
              <p className="hex-desc text-blue">
                Administra los libros y publicaciones del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Expedientes */}
        <div
          className="hexagon bg-gradient-to-l from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => router.push("/mostrarExpedientes")}
        >
          <div className="hex-content">
            <Image
              src="/images/expedientes.png"
              alt="Gestión de Expedientes"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
                Expedientes
              </h2>
              <p className="hex-desc text-blue">
                Gestiona expedientes relacionados con los libros del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Usuarios */}
        <div
          className="hexagon bg-gradient-to-l from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Usuarios")}
        >
          <div className="hex-content">
            <Image
              src="/images/usuario.png"
              alt="Gestión de Usuarios"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <Link href="/mostrarUsuarios">
                <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
                  Usuarios
                </h2>
              </Link>
              <p className="hex-desc text-blue">
                Administra los usuarios del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => router.push("/estadisticas")}
        >
          <div className="hex-content">
            <Image
              src="/images/analisis.png"
              alt="Visualización de Estadísticas"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
                Estadísticas
              </h2>
              <p className="hex-desc text-blue">
                Visualiza las estadísticas del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Solicitudes */}
        <div
          className="hexagon bg-gradient-to-l from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Solicitudes")}
        >
          <div className="hex-content">
            <Image
              src="/images/solicitudes.png"
              alt="Gestión de Solicitudes"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <Link href="/mostrarSolicitudes">
                <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
                  Solicitudes
                </h2>
              </Link>
              <p className="hex-desc text-blue">
                Administra las solicitudes de los lectores del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Soporte */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg cursor-pointer transition-transform hover:scale-105 hover:shadow-xl border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de soporte")}
        >
          <div className="hex-content">
            <Image
              src="/images/soporte.png"
              alt="Visualización de Soporte"
              width={80}
              height={80}
              className="hex-icon"
            />
            <div>
              <Link href="/mostrarSoporte">
                <h2 className="hex-title font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
                  Soporte
                </h2>
              </Link>
              <p className="hex-desc text-blue">
                Gestiona las solicitudes de soporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;
