"use client";

import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
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
          .select("id_libro, titulo, sinopsis, isbn, portada");
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
        className="relative flex flex-col items-center justify-center w-full 
        pt-16 pb-8 
        min-h-[calc(100vh-4rem)] 
        bg-cover bg-center mb-8 mt-8"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {filteredBooks.length === 0 ? (
          <p>No hay libros disponibles.</p>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id_libro}
              className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <Image
                src={
                  isValidUrl(book.portada)
                    ? book.portada
                    : "/images/default-placeholder.jpg"
                }
                alt={book.titulo}
                layout="responsive"
                width={300}
                height={400}
                className="object-cover h-48"
              />
              <div className="p-4">
                <h3 className="font-semibold">{book.titulo}</h3>
                <p>
                  <strong>Descripción:</strong> {book.sinopsis}
                </p>
                <button
                  onClick={() => setSelectedBook(book)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-blue">
            <h2 className="text-2xl font-bold mb-4">{selectedBook.titulo}</h2>
            <p>
              <strong>ISBN:</strong> {selectedBook.isbn}
            </p>
            <p>
              <strong>Descripción:</strong> {selectedBook.sinopsis}
            </p>
            <button
              onClick={() => setSelectedBook(null)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CatalogoCompleto;
