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
import { FaSearch } from "react-icons/fa";

const CatalogoCompletoPage = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagina, setPagina] = useState(0);
  const librosPorPagina = 6;

  // Función para obtener los datos de la tabla
  const fetchLibros = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("libros").select("*");
    if (error) {
      setError(error.message);
    } else {
      setLibros(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  const filteredLibros = libros.filter((libro) =>
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const librosAmostrar = filteredLibros.slice(
    pagina * librosPorPagina,
    (pagina + 1) * librosPorPagina
  );

  const manejarPaginaAnterior = () => {
    if (pagina > 0) setPagina(pagina - 1);
  };

  const manejarPaginaSiguiente = () => {
    if (pagina < Math.ceil(filteredLibros.length / librosPorPagina) - 1)
      setPagina(pagina + 1);
  };

  const manejarClickTitulo = (libro) => {
    setSelectedBook(libro);
  };

  const cerrarModal = () => {
    setSelectedBook(null);
  };

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

      {/* Barra de búsqueda */}
      <div className="mb-4 flex items-center justify-center">
        <div className="w-full max-w-md flex items-center">
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagina(0); // Resetear a la primera página al buscar
            }}
            className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A]"
          />
          <button className="ml-2 w-12 h-12 bg-[#FFC107] text-[#1E3A8A] flex items-center justify-center transform rotate-30 clip-hexagon">
            <div className="w-full h-full flex items-center justify-center -rotate-30">
              <FaSearch className="text-[#1E3A8A]" />
            </div>
          </button>
        </div>
        <style jsx>{`
          .clip-hexagon {
            clip-path: polygon(
              50% 0%,
              100% 25%,
              100% 75%,
              50% 100%,
              0% 75%,
              0% 25%
            );
          }
        `}</style>
      </div>

      {/* Catálogo */}
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
                {libro.portada ? (
                  <Image
                    src={libro.portada}
                    alt={libro.titulo}
                    className="rounded-lg shadow-md"
                    width={240}
                    height={320}
                    priority
                  />
                ) : (
                  <p>No hay imagen disponible</p>
                )}
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
      </section>

      {/* Modal para mostrar detalles del libro */}
      {selectedBook && (
        <ModalGalery libro={selectedBook} closeModal={cerrarModal} />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CatalogoCompletoPage;




