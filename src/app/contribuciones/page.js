"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

const ContribucionesPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Contribuciones y Agradecimientos
        </h1>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Imagenes
        </h2>
        <p className="text-gray-700 mb-4">
          Agradecemos a los siguientes autores y plataformas por las imágenes
          utilizadas en este proyecto:
        </p>

        <ul className="list-disc pl-5 mt-2">
          <li>
            <p className="text-gray-700 mb-4">Fotos descargadas de: </p>{" "}
            <Link
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Unsplash
            </Link>
          </li>
          <li>
            <p className="text-gray-700 mb-4">
              Imágenes de íconos proporcionadas por:{" "}
            </p>{" "}
            <Link
              href="https://www.flaticon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Flaticon
            </Link>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Íconos
        </h2>
        <p className="text-gray-700 mb-4">
          Los íconos utilizados en esta web provienen de las siguientes fuentes:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            <p className="text-gray-700 mb-4">Íconos de: </p>{" "}
            <Link
              href="https://fontawesome.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              FontAwesome
            </Link>
          </li>
          <li>
            <p className="text-gray-700 mb-4">Íconos de: </p>{" "}
            <Link
              href="https://material.io/resources/icons/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Material Icons
            </Link>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Bibliotecas y Herramientas
        </h2>
        <p className="text-gray-700 mb-4">
          Este proyecto ha sido desarrollado utilizando las siguientes
          bibliotecas y herramientas:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Next.js
            </Link>{" "}
            <p className="text-gray-700 mb-4">
              - Framework utilizado para el desarrollo de la aplicación web.
            </p>
          </li>
          <li>
            <Link
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Tailwind CSS
            </Link>{" "}
            <p className="text-gray-700 mb-4">
              - Utilizado para el diseño y la implementación del estilo.
            </p>
          </li>
          <li>
            <Link
              href="https://getbootstrap.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Bootstrap
            </Link>{" "}
            <p className="text-gray-700 mb-4">
              - Biblioteca de componentes para el frontend.
            </p>
          </li>
          <li>
            <Link
              href="https://supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Supabase
            </Link>{" "}
            <p className="text-gray-700 mb-4">
              - Framework utilizado para el desarrollo del backend de la
              aplicación web.
            </p>
          </li>
          <li>
            <Link
              href="https://nodejs.org/en"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              NodeJs
            </Link>{" "}
            <p className="text-gray-700 mb-4">
              - Entorno de ejecución de JavaScript multiplataforma, de código
              abierto y gratuito que permite a los desarrolladores crear
              servidores, aplicaciones web, herramientas de línea de comandos y
              scripts.
            </p>
          </li>
        </ul>
        <li>
          <Link
            href="https://code.visualstudio.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            Visual Studio Code
          </Link>{" "}
          <p className="text-gray-700 mb-4">- Editor de codigo.</p>
        </li>

        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Licencias
        </h2>
        <p className="text-gray-700 mb-4">
          Los recursos utilizados en este proyecto están sujetos a las
          siguientes licencias:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            <p className="text-gray-700 mb-4">
              Imágenes y gráficos bajo la licencia de:{" "}
            </p>{" "}
            <Link
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
            >
              Creative Commons Attribution 4.0
            </Link>
          </li>
          <li>
            <p className="text-gray-700 mb-4">
              Íconos y bibliotecas están bajo las licencias especificadas por
              los proveedores correspondientes.
            </p>
          </li>
        </ul>
        <p>
          <Link
            href="/"
            className="text-2xl font-light text-center text-gold mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            Regresar al inicio
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default ContribucionesPage;
