"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";
import { FaSearch } from "react-icons/fa";
import { toastError } from "@/lib/toastUtils";
import EditorialLogo from "./EditorialLogo";

const ModalBuscarLibros = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("libros")
          .select("id_libro, titulo, sinopsis, isbn, portada");

        if (error) throw error;
        setBooks(data);
      } catch (error) {
        console.error("Error al cargar los libros", error.message);
        toastError("Error al cargar los libros");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [open]);

  const filteredBooks = books.filter((book) =>
    book.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative shadow-lg">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-2xl font-bold text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

        {/* Encabezado con logo */}
        <h2 className="text-2xl font-bold text-blue mb-4 text-center">
          ¿Necesitas un título en especial?
        </h2>

        <div className="flex flex-col items-center gap-4">
          <EditorialLogo />

          {/* Barra de búsqueda */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-full max-w-md flex items-center">
              <input
                type="text"
                placeholder="Buscar libros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gold rounded-l p-3 flex-grow bg-gradient-to-r from-yellow to-white placeholder-blue text-gray-500"
              />
              <button className="ml-2 w-12 h-12 bg-orange text-blue flex items-center justify-center transform rotate-30 clip-hexagon">
                <div className="w-full h-full flex items-center justify-center -rotate-30">
                  <FaSearch />
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

          {searchTerm && (
            <p className="text-sm text-gray-500 text-center mb-2">
              Haz clic en Limpiar para ver todos los libros.
            </p>
          )}

          {/* Resultados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {loading ? (
              <p className="text-center text-gray-500 col-span-2">
                Cargando libros...
              </p>
            ) : filteredBooks.length === 0 ? (
              <p className="text-center text-gray-500 col-span-2">
                No se encontraron libros.
              </p>
            ) : (
              filteredBooks.map((book) => (
                <div
                  key={book.id_libro}
                  className="border border-yellow rounded-lg p-4 flex gap-4 shadow-sm"
                >
                  <Image
                    src={book.portada || "/images/placeholder.png"}
                    alt={book.titulo}
                    width={80}
                    height={120}
                    className="object-cover rounded"
                  />
                  <div className="text-sm text-blue">
                    <h3 className="text-lg font-semibold">{book.titulo}</h3>
                    <p className="text-xs italic text-gray-600">{book.isbn}</p>
                    <p className="text-sm mt-1 line-clamp-3">{book.sinopsis}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Botón de cerrar alternativo */}
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-yellow hover:bg-orange text-blue font-semibold rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalBuscarLibros;
