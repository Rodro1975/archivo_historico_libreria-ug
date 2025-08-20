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
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ModalVentas from "@/components/ModalVentas";

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
    console.log("Libro seleccionado:", libro);
    setSelectedBook(libro);
  };

  const cerrarModal = () => {
    setSelectedBook(null);
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  useEffect(() => {
    console.log("Estado de selectedBook:", selectedBook);
  }, [selectedBook]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <section className="px-4 py-12 mx-auto max-w-7xl overflow-hidden">
        <div className="grid items-center grid-cols-1 gap-10 px-6 py-6 text-blue bg-gradient-to-r from-yellow to-gray-200 border-pink-100 rounded-none card-body sm:rounded-lg md:px-10 md:grid-cols-5 lg:gap-0">
          {/* Contenido de la izquierda */}
          <div className="col-span-1 md:col-span-2 text-center md:text-left">
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
              className="w-full sm:w-auto text-white border border-blue bg-blue hover:bg-blue hover:text-orange transition duration-200 shadow-lg py-2 px-4 rounded-full text-center"
            >
              ¡Visita nuestra página!
            </Link>
          </div>

          {/* Imagen de la derecha */}
          <div className="col-span-1 md:col-span-3 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
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

      {/* Modal Ventas */}
      <ModalVentas />

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
                    src={
                      isValidUrl(libro.portada)
                        ? libro.portada
                        : "/default-image.jpg"
                    }
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

        <div className="flex flex-col items-center justify-center mt-20 space-x-0 space-y-2 md:space-x-4 md:space-y-0 md:flex-row mb-20">
          <button
            onClick={manejarPaginaAnterior}
            className="flex items-center justify-center w-full md:w-auto rounded-full bg-gradient-to-r from-yellow to-orange text-blue px-6 py-3 shadow-lg hover:from-yellow hover:to-gold hover:shadow-xl transition transform duration-300 ease-in-out hover:scale-105 active:scale-95"
            aria-label="Página anterior"
          >
            <FaArrowLeft className="mr-2" />
            Anterior
          </button>

          <span className="px-6 py-3 text-xl font-semibold text-blue-900 select-none">
            {pagina + 1}
          </span>

          <button
            onClick={manejarPaginaSiguiente}
            className="flex items-center justify-center w-full md:w-auto rounded-full bg-gradient-to-r from-orange to-yellow text-blue px-6 py-3 shadow-lg hover:from-gold hover:to-yellow hover:shadow-xl transition transform duration-300 ease-in-out hover:scale-105 active:scale-95"
            aria-label="Página siguiente"
          >
            Siguiente
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedBook && (
        <ModalGalery
          isOpen={!!selectedBook}
          onClose={cerrarModal}
          libro={selectedBook}
        />
      )}
      <Footer />
    </div>
  );
};

export default CatalogoPage;
