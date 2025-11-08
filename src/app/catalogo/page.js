"use client";

import React, { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import supabase from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import ModalGalery from "@/components/ModalGalery";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ModalVentas from "@/components/ModalVentas";

const CatalogoPage = () => {
  // Estado principal
  const [loading, setLoading] = useState(true);
  const [libros, setLibros] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  // Config: libros por página
  const librosPorPagina = 6;

  // Carga de libros desde Supabase
  const fetchLibros = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("libros").select("*");
    if (error) {
      setError(error.message);
      setLibros([]);
    } else {
      setLibros(data || []);
    }
    setLoading(false);
  };

  // Valida URL de portada
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Cálculo de la página actual
  const librosAmostrar = libros.slice(
    pagina * librosPorPagina,
    (pagina + 1) * librosPorPagina
  );

  // Navegación de páginas
  const manejarPaginaAnterior = () => {
    if (pagina > 0) setPagina((p) => p - 1);
  };
  const manejarPaginaSiguiente = () => {
    const ultima = Math.ceil(libros.length / librosPorPagina) - 1;
    if (pagina < ultima) setPagina((p) => p + 1);
  };

  // Abrir/cerrar modal
  const manejarClickTitulo = (libro) => setSelectedBook(libro);
  const cerrarModal = () => setSelectedBook(null);

  // Carga inicial
  useEffect(() => {
    fetchLibros();
  }, []);

  if (loading)
    return <p className="text-white text-center mt-10">Cargando...</p>;
  if (error)
    return <p className="text-red-200 text-center mt-10">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />

      {/* Hero simple con CTA */}
      <section className="px-4 py-12 mx-auto max-w-7xl overflow-hidden">
        <div className="grid items-center grid-cols-1 gap-10 px-6 py-6 text-blue bg-gradient-to-r from-yellow to-gray-200 rounded-none card-body sm:rounded-lg md:px-10 md:grid-cols-5 lg:gap-0">
          {/* Texto */}
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

          {/* Imagen */}
          <div className="col-span-1 md:col-span-3 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
              <Image
                src="/images/libreriaUg.png"
                alt="Interior Libreria"
                className="w-full h-auto object-cover transition-transform duration-300 transform hover:scale-105 rounded-lg"
                width={500}
                height={300}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal Ventas (widget global) */}
      <ModalVentas />

      {/* Catálogo */}
      <div className="catalogo-container">
        <section className="px-4 py-24 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {librosAmostrar.map((libro, index) => (
              <div
                key={libro.id_libro ?? index}
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
                        : "/images/default-placeholder.jpg"
                    }
                    alt={libro.titulo}
                    className="rounded-lg shadow-md"
                    width={240}
                    height={320}
                  />
                </div>

                <h3
                  onClick={() => manejarClickTitulo(libro)}
                  className="text-xl font-semibold cursor-pointer text-gray-800 hover:text-white transition-colors duration-200"
                  title="Ver detalles"
                >
                  {libro.titulo}
                </h3>

                {/* Nota: 'autor' no existe en la tabla libros; quedará vacío si no lo calculas/join */}
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

      {/* Modal de detalles */}
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
