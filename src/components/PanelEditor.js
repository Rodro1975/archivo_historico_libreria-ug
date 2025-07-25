//components/PanelAdmin.js
"use client"; // Asegúrate de que este es un Client Component

import React from "react";
import { FaUsers, FaBook, FaFileAlt, FaChartBar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PanelEditor = () => {
  const router = useRouter();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-blue font-bold mb-4">Panel del Editor</h1>

      {/* Estilos para el hexágono */}
      <style jsx>{`
        .hexagon {
          position: relative;
          width: 280px; /* Ancho de cada tarjeta hexagonal */
          height: 260px;
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
        }

        .hexagon-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center; /* Centrar texto dentro del hexágono */
        }

        .hexagon-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr); /* Dos columnas por defecto */
          gap: 20px; /* Espacio entre las tarjetas */
        }

        @media (max-width: 768px) {
          .hexagon-container {
            grid-template-columns: 1fr; /* En pantallas pequeñas, una columna */
          }
        }

        @media (min-width: 1024px) {
          .hexagon-container {
            grid-template-columns: repeat(
              3,
              1fr
            ); /* Tres columnas en pantallas grandes */
          }
        }
      `}</style>

      {/* Contenedor de tarjetas */}
      <div className="hexagon-container">
        {/* Tarjeta para Gestión de Autores */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg p-6 flex items-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl mb-6 border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Autores")}
        >
          <Image
            src="/images/autores.png"
            alt="Gestión de Autores"
            width={80}
            height={80}
            className="mr-4"
          />
          <div>
            {/* Enlace con href a /libros */}
            <Link href="/mostrarAutores">
              <h2 className="text-2xl font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
                Autores
              </h2>
            </Link>
            <p className="text-blue text-sm">
              Administra los Autores y sus publicaciones del sistema.
            </p>
          </div>
        </div>
        {/* Tarjeta para Gestión de Libros */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg p-6 flex items-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl mb-6 border-l-4 border-[#FFD700]"
          onClick={() => console.log("Gestión de Libros")}
        >
          <Image
            src="/images/libro.png"
            alt="Gestión de Libros"
            width={80}
            height={80}
            className="mr-4"
          />
          <div>
            {/* Enlace con href a /libros */}
            <Link href="/mostrarLibros">
              <h2 className="text-2xl font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
                Libros
              </h2>
            </Link>
            <p className="text-blue text-sm">
              Administra los libros y publicaciones del sistema.
            </p>
          </div>
        </div>

        {/* Tarjeta para Generación de Informes */}
        <div
          className="hexagon bg-gradient-to-l from-[#FFD700] to-[#FFA500] shadow-lg p-6 flex items-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl mb-6 border-l-4 border-[#FFD700]"
          onClick={() => router.push("/informes")} // Ahora router está definido
        >
          <Image
            src="/images/informe.png"
            alt="Generación de Informes"
            width={80}
            height={80}
            className="mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold text-blue transition-colors duration-300 hover:text-[#FFA500]">
              Informes
            </h2>
            <p className="text-blue text-sm">
              Genera informes detallados del sistema.
            </p>
          </div>
        </div>

        {/* Tarjeta para Visualización de Estadísticas */}
        <div
          className="hexagon bg-gradient-to-r from-[#FFD700] to-[#FFA500] shadow-lg p-6 flex items-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-xl mb-6 border-l-4 border-[#FFD700]"
          onClick={() => router.push("/estadisticas")}
        >
          <Image
            src="/images/analisis.png"
            alt="Visualización de Estadísticas"
            width={80}
            height={80}
            className="mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold text-blue transition-colors duration-300 hover:text-[#FFD700]">
              Estadísticas
            </h2>
            <p className="text-blue text-sm">
              Visualiza las estadísticas del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelEditor;
