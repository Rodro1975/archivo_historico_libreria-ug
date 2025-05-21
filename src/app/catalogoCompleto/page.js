"use client";

import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Image from "next/image";
import WorkBar from "../../components/WorkBar";
import supabase from "../../lib/supabase";
import Footer from "../../components/Footer";

const CatalogoCompleto = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("libros")
          .select(
            "id_libro, titulo, sinopsis, isbn, portada, codigoRegistro, coleccion, numeroEdicion, anioPublicacion, formato, tipoAutoria, numeroPaginas"
          );
        if (error) throw error;
        setBooks(data);
      } catch (error) {
        console.error("Error al cargar los libros:", error.message);
      }
    };

    fetchBooks();
  }, []);

  // Función para validar si la URL es correcta
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Filtrar los libros con el término de búsqueda
  const filteredBooks = books.filter((book) =>
    book.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="sticky top-0 z-50">
        <WorkBar />
      </div>
      {/* Hero */}
      <div
        className="
    relative flex flex-col items-center justify-center w-full    
    min-h-[calc(110vh-4rem)]
    pt-0 pb-0
    bg-cover bg-center mb-8
  "
        style={{
          backgroundImage: "url('/images/biblioteca.jpg')",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-red-700 via-transparent to-[#D2B48C]"
          style={{ opacity: 0.85 }}
        />

        <div className="relative z-10 text-center px-6 md:px-12 lg:w-3/4">
          <h1 className="text-6xl md:text-6xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-xl">
            Archivo Histórico Editorial UG
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white drop-shadow-lg">
            Accede a una vasta colección de libros históricos. Colabora, edita y
            enriquece el legado editorial que define nuestra historia.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda con botón limpiar */}
      <div className="mb-4 flex items-center justify-center">
        <div className="w-full max-w-md flex items-center">
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchTerm}
            onChange={handleSearch}
            className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A]"
          />
          <button className="ml-2 w-12 h-12 bg-[#FFC107] text-[#1E3A8A] flex items-center justify-center transform rotate-30 clip-hexagon">
            <div className="w-full h-full flex items-center justify-center -rotate-30">
              <FaSearch className="text-[#1E3A8A]" />
            </div>
          </button>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded"
              title="Limpiar búsqueda"
            >
              Limpiar
            </button>
          )}
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
      {/* Mensaje contextual */}
      {searchTerm && (
        <p className="text-sm text-gray-500 text-center mb-2">
          Haz clic en Limpiar para ver todos los libros.
        </p>
      )}

      {/* Tarjetas de libros WOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4 md:px-10 lg:px-24 mb-4">
        {filteredBooks.length === 0 ? (
          <p>No hay libros disponibles.</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id_libro}
              className="group relative border-4 border-gold shadow-xl rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange"
              style={{
                minHeight: 420,
              }}
            >
              {/* Portada cubre toda la tarjeta */}
              <Image
                src={
                  isValidUrl(book.portada)
                    ? book.portada
                    : "/images/default-placeholder.jpg"
                }
                alt={book.titulo}
                width={400}
                height={500}
                className="object-cover w-full h-full min-h-[420px] transition-all duration-300 group-hover:brightness-90"
              />
              {/* Badge de colección */}
              <div
                className="absolute top-4 left-4
                 bg-black bg-opacity-30 backdrop-blur-sm text-white font-extrabold
                 px-4 py-2 rounded-md shadow-md
                 text-sm uppercase tracking-wider
                 z-10"
              >
                {book.coleccion || "Colección"}
              </div>

              {/* Botón Detalles */}
              <button
                onClick={() => setSelectedBook(book)}
                title="Ver detalles"
                className="
    absolute bottom-4 left-1/2 transform -translate-x-1/2
    flex items-center gap-2
    text-white text-lg font-bold
    drop-shadow-md
    hover:text-yellow-300 hover:scale-110
    transition duration-200
    z-20
    px-4 py-2
    rounded-md
    bg-black bg-opacity-40
    "
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <FaPlus className="inline-block w-5 h-5 mr-1" />
                <span>Detalles</span>
              </button>

              {/* Overlay para efecto al pasar el mouse */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))
        )}
      </div>

      {/* Modal WOW optimizado para todos los dispositivos */}
      {selectedBook && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 animate-fadeIn p-4">
          <div
            className="relative bg-gradient-to-br from-yellow via-gold to-orange rounded-3xl shadow-2xl border-4 border-gold w-full p-6 md:p-8 animate-slideUp overflow-y-auto"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "36rem",
            }}
          >
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 hover:bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-4xl transition-all duration-300"
              title="Cerrar"
            >
              ×
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold text-blue mb-4 text-center drop-shadow pr-8">
              {selectedBook.titulo}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Código de registro:
                  </span>{" "}
                  {selectedBook.codigoRegistro}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">Colección:</span>{" "}
                  {selectedBook.coleccion}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">Edición:</span>{" "}
                  {selectedBook.numeroEdicion}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Año de publicación:
                  </span>{" "}
                  {selectedBook.anioPublicacion}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">Formato:</span>{" "}
                  {selectedBook.formato}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    N° de páginas:
                  </span>{" "}
                  {selectedBook.numeroPaginas}
                </p>
              </div>
              <div>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">ISBN:</span>{" "}
                  {selectedBook.isbn}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Tipo de autoría:
                  </span>{" "}
                  {selectedBook.tipoAutoria}
                </p>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">Descripción:</span>
                  <span className="block text-gray-400 text-sm mt-1">
                    {selectedBook.sinopsis}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Image
                src={
                  isValidUrl(selectedBook.portada)
                    ? selectedBook.portada
                    : "/images/default-placeholder.jpg"
                }
                alt={selectedBook.titulo}
                width={220}
                height={280}
                className="rounded-xl shadow-xl border-2 border-blue"
              />
            </div>
          </div>
          <style jsx global>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease;
            }
            @keyframes slideUp {
              from {
                transform: translateY(40px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            .animate-slideUp {
              animation: slideUp 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            }
          `}</style>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CatalogoCompleto;
