"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Image from "next/image";
import WorkBar from "../../components/WorkBar";
import supabase from "../../lib/supabase";

const CatalogoCompleto = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const closeBtnRef = useRef(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  //Estado para autores
  const [authorData, setAuthorData] = useState({
    principal: null,
    otros: [],
    coeditores: [],
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("libros")
          .select(
            "id_libro, titulo, subtitulo, sinopsis, isbn, portada, codigoRegistro, coleccion, numeroEdicion, anioPublicacion, formato, tipoAutoria, numeroPaginas"
          );
        if (error) throw error;
        setBooks(data);
      } catch (error) {
        console.error("Error al cargar los libros:", error.message);
      }
    };

    fetchBooks();
  }, []);

  // Bloqueo de scroll, foco y cierre con ESC cuando el modal está abierto
  useEffect(() => {
    if (!selectedBook) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") setSelectedBook(null);
    };
    document.addEventListener("keydown", onKeyDown);

    // foco al botón cerrar
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedBook]);

  //***Dispara el cargador de libros cuando se abre el modal */
  useEffect(() => {
    if (!selectedBook?.id_libro) {
      setAuthorData({ principal: null, otros: [], coeditores: [] });
      return;
    }
    loadAuthors(selectedBook.id_libro);
  }, [selectedBook]);

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
    (book?.titulo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Muestra "—" si viene null/undefined o string vacío
  const show = (v) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
      ? "—"
      : v;

  // Mapea formato a la etiqueta pedida
  const showFormatos = (f) => {
    if (!f) return "—";
    const v = String(f).toLowerCase();
    if (v === "impreso") return "Impreso";
    if (v === "electronico" || v === "electrónico") return "Electrónico";
    if (v === "ambos") return "Impreso y Electrónico";
    return f; // fallback por si aparece otro valor
  };

  //***Cargador de autores del libro seleccionado***
  const loadAuthors = async (libroId) => {
    try {
      // Opción A — JOIN directo (requiere FK libro_autor.autor_id -> autores.id)
      const { data, error } = await supabase
        .from("libro_autor")
        .select(`tipo_autor, autor:autores ( id, nombre_completo )`)
        .eq("libro_id", libroId);

      if (error) throw error;

      const rows = (data || []).filter((r) => r.autor?.nombre_completo);
      const isRole = (row, re) =>
        (row?.tipo_autor || "").toString().toLowerCase().match(re);

      const coeditores = rows
        .filter((r) => isRole(r, /coeditor/))
        .map((r) => r.autor.nombre_completo);

      // principal explícito; fallback: 'autor' puro; fallback 2: primero de la lista
      const principalRow =
        rows.find((r) => isRole(r, /principal/)) ||
        rows.find((r) => isRole(r, /^autor$/)) ||
        rows[0];

      const principal = principalRow?.autor?.nombre_completo || null;

      const otros = rows
        .filter(
          (r) =>
            r !== principalRow && // excluye principal
            !isRole(r, /coeditor/) // excluye coeditores
        )
        .map((r) => r.autor.nombre_completo);

      setAuthorData({ principal, otros, coeditores });
    } catch (err) {
      console.error("Error al cargar autores:", err.message);
      setAuthorData({ principal: null, otros: [], coeditores: [] });
    }
  };

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
            Galería del editor{" "}
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white drop-shadow-lg">
            Acceso rápido a publicaciones
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
            className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A] text-gray-500"
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
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 animate-fadeIn p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
          aria-describedby="book-modal-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBook(null);
          }}
        >
          <div
            className="relative bg-gradient-to-br from-yellow via-gold to-orange rounded-3xl shadow-2xl border-4 border-gold w-full p-6 md:p-8 animate-slideUp overflow-y-auto"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              width: "36rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 hover:bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-4xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/80"
              title="Cerrar"
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2
              id="book-modal-title"
              className="text-2xl md:text-3xl font-extrabold text-blue text-center drop-shadow pr-8"
            >
              {selectedBook.titulo}
            </h2>

            {Boolean(selectedBook?.subtitulo?.trim()) && (
              <p
                id="book-modal-subtitle"
                className="mt-1 mb-4 text-base md:text-lg text-blue/90 font-semibold text-center"
              >
                {selectedBook.subtitulo}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              {/* Columna 1 */}
              <div>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Código de registro:
                  </span>{" "}
                  {show(selectedBook.codigoRegistro)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Autor principal:
                  </span>{" "}
                  {authorData.principal ?? "—"}
                </p>

                {authorData.otros.length > 0 && (
                  <p className="mb-1">
                    <span className="font-bold text-gray-700">
                      Otros autores:
                    </span>{" "}
                    {authorData.otros.join(", ")}
                  </p>
                )}

                <p className="mb-1">
                  <span className="font-bold text-gray-700">Colección:</span>{" "}
                  {show(selectedBook.coleccion)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">Edición:</span>{" "}
                  {show(selectedBook.numeroEdicion)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Año de publicación:
                  </span>{" "}
                  {show(selectedBook.anioPublicacion)}
                </p>
              </div>

              {/* Columna 2 */}
              <div>
                <p className="mb-1">
                  <span className="font-bold text-gray-700">Formatos:</span>{" "}
                  {showFormatos(selectedBook.formato)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Núm. de páginas:
                  </span>{" "}
                  {show(selectedBook.numeroPaginas)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">ISBN UG:</span>{" "}
                  {show(selectedBook.isbn)}
                </p>

                <p className="mb-1">
                  <span className="font-bold text-gray-700">
                    Tipo de autoría:
                  </span>{" "}
                  {show(selectedBook.tipoAutoria)}
                </p>

                {authorData.coeditores.length > 0 && (
                  <p className="mb-1">
                    <span className="font-bold text-gray-700">Coeditores:</span>{" "}
                    {authorData.coeditores.join(", ")}
                  </p>
                )}

                <p className="mb-1">
                  <span className="font-bold text-gray-700">Sinopsis:</span>
                  <span
                    id="book-modal-desc"
                    className="block text-gray-100/90 text-sm mt-1"
                  >
                    {show(selectedBook.sinopsis)}
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
    </div>
  );
};

export default CatalogoCompleto;
