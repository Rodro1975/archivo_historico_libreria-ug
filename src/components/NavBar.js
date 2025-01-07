"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";  // Importa useRouter
import Image from "next/image";
import Link from 'next/link';

const NavBar = () => {
  const [isClient, setIsClient] = useState(false); // Estado para verificar si estamos en el cliente
  const [currentPath, setCurrentPath] = useState("");
  const [isOpen, setIsOpen] = useState(false);  // Estado para el menú
  const router = useRouter(); // Aquí usamos directamente el hook

  useEffect(() => {
    setIsClient(true); // Cuando el componente se monta en el cliente
  }, []);

  useEffect(() => {
    if (isClient) {
      setCurrentPath(router.pathname); // Establece la ruta solo si estamos en el cliente
    }
  }, [isClient, router.pathname]);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a
          href="https://www.ugto.mx/index.php"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/images/escudo-horizontal-png.png"
            className="h-12"
            alt="UGTO Logo"
            width={150} // Ajusta el tamaño de la imagen
            height={50} // Ajusta el tamaño de la imagen
            style={{ width: '100%', height: 'auto' }} 
          />
        </a>
        <a
          href="https://libreriaug.ugto.mx/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/images/logo_libreria.png"
            alt="Librería Logo"
            width={150} // Ajusta el ancho
            height={50} // Ajusta la altura
            style={{ width: '100%', height: 'auto' }} // Mantén la proporción
          />

        </a>
        <div className="flex md:order-2">
          <button
            onClick={() => setIsOpen(!isOpen)}  // Cambia el estado de isOpen al hacer click
            type="button"
            aria-controls="navbar-search"
            aria-expanded={isOpen}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5h14M3 10h14M3 15h14"
              />
            </svg>
            <span className="sr-only">Toggle menu</span>
          </button>

          {/* Barra de búsqueda para pantallas medianas */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search icon</span>
            </div>
            <input
              type="text"
              id="search-navbar-md"
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Menú y barra de búsqueda para pantallas pequeñas */}
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isOpen ? "block" : "hidden"}`}
          id="navbar-search"
        >
          {/* Barra de búsqueda para pantallas pequeñas */}
          <div className="relative md:hidden mb-4">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search icon</span>
            </div>
            <input
              type="text"
              id="search-navbar-sm"
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search..."
            />
          </div>

          {/* Menú de navegación */}
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link href="/" passHref>
                <span
                  className={`block py-2 px-3 text-[#003c71] ${currentPath === "/" ? "animate__animated animate__hinge" : ""} font-semibold`}
                  aria-current={currentPath === "/" ? "page" : undefined}
                >
                  Archivo Histórico
                </span>
              </Link>
            </li>

            <li>
              <Link href="/login">
                <span
                  className={`block py-2 px-3 text-[#003c71] ${currentPath === "/login" ? "animate__animated animate__hinge" : ""} font-semibold`}
                >
                  Login
                </span>
              </Link>
            </li>
            <li>
              <Link href="/register">
                <span
                  className={`block py-2 px-3 text-[#003c71] ${currentPath === "/register" ? "animate__animated animate__hinge" : ""} font-semibold`}
                >
                  Regístrate
                </span>
              </Link>
            </li>
            <li>
              <Link href="/catalog">
                <span
                  className={`block py-2 px-3 text-[#003c71] ${currentPath === "/catalog" ? "animate__animated animate__hinge" : ""} font-semibold`}
                  aria-current={currentPath === "/catalog" ? "page" : undefined}
                >
                  Catálogo
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;





