"use client";

import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Image from "next/image";
import WorkBar from "../../components/WorkBar";
import supabase from "../../lib/supabase";
import BookQuickViewModal from "@/components/BookQuickViewModal";

const CatalogoCompleto = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("libros")
          .select(
            "id_libro, titulo, subtitulo, sinopsis, isbn, portada, codigoRegistro, coleccion, numeroEdicion, anioPublicacion, formato, tipoAutoria, numeroPaginas"
          );
        if (error) throw error;
        setBooks(data || []);
      } catch (error) {
        console.error("Error al cargar los libros:", error.message);
      }
    };
    fetchBooks();
  }, []);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const filteredBooks = books.filter((book) =>
    (book?.titulo || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        style={{ backgroundImage: "url('/images/biblioteca.jpg')" }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-red-700 via-transparent to-[#D2B48C]"
          style={{ opacity: 0.85 }}
        />
        <div className="relative z-10 text-center px-6 md:px-12 lg:w-3/4">
          <h1 className="text-6xl md:text-6xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-xl">
            Galería del editor
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white drop-shadow-lg">
            Acceso rápido a publicaciones
          </p>
        </div>
      </div>

      {/* Búsqueda + limpiar */}
      <div className="mb-4 flex items-center justify-center">
        <div className="w-full max-w-md flex items-center">
          <input
            type="text"
            placeholder="Buscar libros..."
            value={searchTerm}
            onChange={handleSearch}
            className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A] text-gray-500"
          />
          <button
            className="ml-2 w-12 h-12 bg-[#FFC107] text-[#1E3A8A] flex items-center justify-center transform rotate-30 clip-hexagon"
            tabIndex={-1}
          >
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

      {searchTerm && (
        <p className="text-sm text-gray-500 text-center mb-2">
          Haz clic en Limpiar para ver todos los libros.
        </p>
      )}

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4 md:px-10 lg:px-24 mb-4">
        {filteredBooks.length === 0 ? (
          <p>No hay libros disponibles.</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id_libro}
              className="group relative border-4 border-gold shadow-xl rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange"
              style={{ minHeight: 420 }}
            >
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
              <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white font-extrabold px-4 py-2 rounded-md shadow-md text-sm uppercase tracking-wider z-10">
                {book.coleccion || "Colección"}
              </div>
              <button
                onClick={() => setSelectedBook(book)}
                title="Ver detalles"
                className="
                  absolute bottom-4 left-1/2 -translate-x-1/2
                  flex items-center gap-2 text-white text-lg font-bold
                  drop-shadow-md hover:text-yellow-300 hover:scale-110
                  transition duration-200 z-20 px-4 py-2 rounded-md bg-black/40
                "
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <FaPlus className="inline-block w-5 h-5 mr-1" />
                <span>Detalles</span>
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none"></div>
            </div>
          ))
        )}
      </div>

      {/* Modal vista rapida que intercepta la página */}
      {selectedBook && (
        <BookQuickViewModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default CatalogoCompleto;
