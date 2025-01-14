"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import WorkBar from "@/components/WorkBar";

const CatalogoCompletoPage = () => {
  const [libros, setLibros] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLibros();
  }, []);

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

  const filteredLibros = libros.filter((libro) =>
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="sticky top-0 z-50">
        <WorkBar />
      </div>

      <div
        className="relative flex flex-col items-center justify-center mb-8 h-screen"
        style={{
          backgroundImage: "url('/images/biblioteca.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-red-700 via-transparent to-[#D2B48C] z-0"
          style={{ opacity: 0.85 }}
        ></div>

        <div
          className="flex flex-col items-center justify-center text-gold text-center z-10 px-8 md:px-16 lg:w-3/4"
          style={{ marginTop: "-250px" }}
        >
          <h1 className="text-6xl md:text-8xl font-extrabold leading-tight drop-shadow-xl">
            Archivo Histórico Editorial UG
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white drop-shadow-lg">
            Accede a una vasta colección de libros históricos. Colabora, edita y
            enriquece el legado editorial que define nuestra historia.
          </p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-4">
        {loading ? (
          <p>Cargando libros...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : filteredLibros.length === 0 ? (
          <p>No hay libros disponibles.</p>
        ) : (
          filteredLibros.map((book) => (
            <div
              key={book.id_libro}
              className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <Image
                src={book.portada}
                alt={book.titulo}
                layout="responsive"
                width={300}
                height={400}
                className="object-cover h-48"
              />
              <div className="p-4">
                <h3 className="font-semibold">{book.titulo}</h3>

                <button
                  onClick={() => setSelectedBook(book)}
                  className="mt-2 bg-orange text-white hover:bg-gold px-4 py-2 rounded"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para mostrar detalles del libro */}
      {selectedBook && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-blue">
            <h2 className="text-2xl font-bold mb-4">{selectedBook.titulo}</h2>
            <p>
              <strong>ISBN:</strong> {selectedBook.isbn}
            </p>
            <p>
              <strong>Sinopsis:</strong> {selectedBook.sinopsis}
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
    </div>
  );
};

export default CatalogoCompletoPage;
