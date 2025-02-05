"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import supabase from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import ModalGalery from "@/components/ModalGalery";
import "animate.css";

const CatalogoPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [libros, setLibros] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState(null);
  const [isInfoBarVisible, setIsInfoBarVisible] = useState(true);
  const [isAnimatingX, setIsAnimatingX] = useState(false);
  const [isAnimatingText, setIsAnimatingText] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const librosPorPagina = 6;
  const router = useRouter();

  // Función para obtener los datos de la tabla
  const fetchLibros = async () => {
    setLoading(true); // Establecer a true mientras se obtienen los libros
    const { data, error } = await supabase.from("libros").select("*");

    if (error) {
      setError(error.message);
    } else {
      setLibros(data);
    }
    setLoading(false); // Establecer a false una vez que se terminan de cargar
  };

  // Función para validar si la URL es válida
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const manejarCerrarBarra = () => {
    setIsAnimatingX(true);
    setTimeout(() => {
      setIsInfoBarVisible(false);
      setIsAnimatingX(false);
    }, 2000);
  };

  const librosAmostrar = libros.slice(
    pagina * librosPorPagina,
    (pagina + 1) * librosPorPagina
  );

  const manejarPaginaAnterior = () => {
    if (pagina > 0) setPagina(pagina - 1);
  };

  const manejarPaginaSiguiente = () => {
    if (pagina < Math.ceil(libros.length / librosPorPagina) - 1)
      setPagina(pagina + 1);
  };

  const manejarClickTitulo = (libro) => {
    setSelectedBook(libro);
  };

  const cerrarModal = () => {
    setSelectedBook(null);
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <section className="px-0 py-12 mx-auto max-w-7xl sm:px-4 overflow-visible">
        <div className="grid items-center grid-cols-1 gap-10 px-4 py-6 text-blue bg-gradient-to-r from-yellow to-gray-200 border-pink-100 rounded-none card card-body sm:rounded-lg md:px-10 md:grid-cols-5 lg:gap-0">
          <div className="col-span-1 md:col-span-2">
            <h2 className="mb-3 font-serif text-2xl font-normal leading-tight lg:text-3xl">
              Explora nuestra colección de libros y recursos disponibles.
            </h2>
            <p className="mb-6 text-sm font-semibold lg:text-base">
              Encuentra libros que te inspiren y enriquezcan tu conocimiento.
            </p>

            <Link
              href="https://www.ugto.mx/editorial/"
              target="_blank"
              rel="noreferrer"
              className="w-full text-blue border border-blue bg-transparent hover:bg-blue hover:text-white transition duration-200 shadow-lg py-2 px-4 rounded-full text-center sm:w-auto"
            >
              ¡Visita nuestra página!
            </Link>
          </div>
          <div className="col-span-1 md:col-span-3 md:flex md:justify-center">
            <div className="relative w-full h-auto ml-6">
              <Image
                src="/images/libreriaUg.png"
                alt="Interior Libreria"
                className="w-full h-auto object-cover transition-transform duration-300 transform hover:scale-105 rounded-lg"
                width={500}
                height={300}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Barra de información */}
      {isInfoBarVisible && (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gradient-to-r from-blue to-gray-800 px-6 py-4 sm:px-3.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="text-sm leading-6 text-white flex items-center">
              <span
                className={`font-bold text-yellow ${
                  isAnimatingText ? "animate__animated animate__heartBeat" : ""
                }`}
                onMouseEnter={() => {
                  setIsAnimatingText(true);
                }}
                onMouseLeave={() => {
                  setIsAnimatingText(false);
                }}
              >
                PONTE ABEJA
              </span>
              <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx="1" cy="1" r="1" />
              </svg>
              Visita la Librería UG y encuentra tu próxima lectura favorita.
            </div>

            <Link
              href="https://libreriaug.ugto.mx/"
              target="_blank"
              rel="noreferrer"
              className="flex-none rounded-full inline-block bg-gray-900 px-3.5 py-1 text-sm font-medium text-gold shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              ¡Comprar Ahora! <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              className={`-m-3 p-3 focus-visible:outline-offset-[-4px] transition-transform duration-500 ease-in-out ${
                isAnimatingX ? "animate__animated animate__rotateOut" : ""
              } hover:scale-110 hover:text-gray-700`}
              onClick={manejarCerrarBarra}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586L15.293 3.293a1 1 0 1 1 1.414 1.414L11.414 10l5.293 5.293a1 1 0 0 1-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L8.586 10 3.293 4.707A1 1 0 1 1 4.707 3.293L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Catálogo */}
      <div className="catalogo-container">
        <section className="px-4 py-24 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {librosAmostrar.map((libro, index) => (
              <div
                key={index}
                className={`transition-transform duration-300 ease-in-out transform hover:scale-105 ${
                  index % 2 === 0
                    ? "bg-gradient-to-b from-yellow to-orange"
                    : "bg-gradient-to-b from-gold to-yellow"
                } p-6 rounded-lg shadow-lg hover:shadow-xl`}
              >
                <div className="flex justify-center mb-4">
                  <Image
                    src={isValidUrl(libro.portada)? libro.portada:"/images/default-placeholder.jpg"}
                    alt={libro.titulo}
                    className="rounded-lg shadow-md"
                    width={240}
                    height={320}
                    priority
                  />
                </div>

                <h3
                  onClick={() => manejarClickTitulo(libro)}
                  className="text-xl font-semibold cursor-pointer text-gray-800"
                >
                  {libro.titulo}
                </h3>

                <p className="mt-2 text-sm text-gray-600">{libro.autor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Paginación */}
        <div className="flex flex-col items-center justify-center mt-20 space-x-0 space-y-2 md:space-x-2 md:space-y-0 md:flex-row">
          <button
            onClick={manejarPaginaAnterior}
            className="w-full rounded-full bg-yellow text-blue px-6 py-3 md:w-auto transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-md hover:bg-orange"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-xl">{pagina + 1}</span>
          <button
            onClick={manejarPaginaSiguiente}
            className="w-full rounded-full bg-yellow text-blue px-6 py-3 md:w-auto transition-transform duration-300 ease-in-out transform hover:scale-105 shadow-md hover:bg-orange"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedBook && <ModalGalery libro={selectedBook} closeModal={cerrarModal} />}
      <Footer />
    </div>
  );
};

export default CatalogoPage;

