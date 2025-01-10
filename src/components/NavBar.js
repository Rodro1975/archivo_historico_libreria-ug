"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Importa useRouter
import Image from "next/image";
import Link from "next/link";
import "animate.css";

const NavBar = () => {
  const [isClient, setIsClient] = useState(false); // Verifica si estamos en el cliente
  const [currentPath, setCurrentPath] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Estado para el menú
  const [isVisible, setIsVisible] = useState(true); // Estado para controlar la visibilidad del texto
  const router = useRouter(); // Hook de Next.js para manejar rutas

  useEffect(() => {
    setIsClient(true); // Confirma que estamos en el cliente
  }, []);

  useEffect(() => {
    if (isClient) {
      setCurrentPath(router.pathname); // Actualiza la ruta actual
    }
  }, [isClient, router.pathname]);

  // Maneja la animación y oculta el texto después de que termine
  const handleAnimation = (e) => {
    e.target.classList.remove("animate__hinge");
    void e.target.offsetWidth; // Forzar reflujo para reiniciar la animación
    e.target.classList.add("animate__hinge");

    // Ocultar el texto después de la animación y navegar a la nueva ruta
    setTimeout(() => {
      setIsVisible(false);
      router.push(e.target.closest("a").href); // Navegar a la nueva ruta
    }, 2000); // Duración de la animación hinge (2 segundos)
  };

  // Restablecer isVisible al cambiar de ruta
  useEffect(() => {
    if (currentPath !== router.pathname) {
      setIsVisible(true);
    }
  }, [currentPath, router.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a
          href="https://www.ugto.mx/index.php"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/images/escudo-horizontal-png.png"
            alt="UGTO Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
            priority
          />
        </a>
        <a
          href="https://libreriaug.ugto.mx/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/images/Logo_libreria.png"
            alt="Librería Logo"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </a>

        <div className="flex md:order-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
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
        </div>

        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isOpen ? "block" : "hidden"
          }`}
          id="navbar-search"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <Link href="/" passHref>
                <span
                  onClick={handleAnimation}
                  className={`block py-2 px-3 text-[#003c71] ${
                    currentPath === "/" && isVisible
                      ? "animate__animated animate__hinge"
                      : ""
                  } font-semibold`}
                  aria-current={currentPath === "/" ? "page" : undefined}
                >
                  Archivo Histórico
                </span>
              </Link>
            </li>

            <li>
              <Link href="/login">
                <span
                  onClick={handleAnimation}
                  className={`block py-2 px-3 text-[#003c71] ${
                    currentPath === "/login" && undefined
                      ? "animate__animated animate__hinge"
                      : ""
                  } font-semibold`}
                >
                  Login
                </span>
              </Link>
            </li>

            <li>
              <Link href="/acercaDe">
                <span
                  onClick={handleAnimation}
                  className={`block py-2 px-3 text-[#003c71] ${
                    currentPath === "/register" && isVisible
                      ? "animate__animated animate__hinge"
                      : ""
                  } font-semibold`}
                >
                  Acerca de
                </span>
              </Link>
            </li>

            <li>
              <Link href="/catalogo">
                <span
                  onClick={handleAnimation}
                  className={`block py-2 px-3 text-[#003c71] ${
                    currentPath === "/catalog" && isVisible
                      ? "animate__animated animate__hinge"
                      : ""
                  } font-semibold`}
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
