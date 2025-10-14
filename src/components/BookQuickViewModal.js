// src/components/BookQuickViewModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function BookQuickViewModal({ book, onClose }) {
  const router = useRouter();
  const closeBtnRef = useRef(null);
  const [authorData, setAuthorData] = useState({
    principal: null,
    otros: [],
    coeditores: [],
  });

  // Cargar autores del libro seleccionado
  useEffect(() => {
    let active = true;

    async function loadAuthors(libroId) {
      try {
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

        const principalRow =
          rows.find((r) => isRole(r, /principal/)) ||
          rows.find((r) => isRole(r, /^autor$/)) ||
          rows[0];

        const principal = principalRow?.autor?.nombre_completo || null;

        const otros = rows
          .filter((r) => r !== principalRow && !isRole(r, /coeditor/))
          .map((r) => r.autor.nombre_completo);

        if (active) setAuthorData({ principal, otros, coeditores });
      } catch {
        if (active)
          setAuthorData({ principal: null, otros: [], coeditores: [] });
      }
    }

    if (book?.id_libro) loadAuthors(book.id_libro);
    else setAuthorData({ principal: null, otros: [], coeditores: [] });

    return () => {
      active = false;
    };
  }, [book]);

  // Bloqueo de scroll + ESC + foco seguro
  useEffect(() => {
    if (!book) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [book, onClose]);

  if (!book) return null;

  const show = (v) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
      ? "—"
      : v;

  const showFormatos = (f) => {
    if (!f) return "—";
    const v = String(f).toLowerCase();
    if (v === "impreso") return "Impreso";
    if (v === "electronico" || v === "electrónico") return "Electrónico";
    if (v === "ambos") return "Impreso y Electrónico";
    return f;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
      aria-describedby="book-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="relative w-full max-w-[36rem] max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-yellow bg-gradient-to-br from-[#FACC15] via-[#FFC107] to-[#FFA500] p-6 md:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título / Subtítulo */}
        <h2
          id="book-modal-title"
          className="text-center text-2xl font-extrabold text-blue md:text-3xl"
        >
          {book.titulo}
        </h2>

        {Boolean(book?.subtitulo?.trim()) && (
          <p
            id="book-modal-subtitle"
            className="mb-4 mt-1 text-center text-base font-semibold text-blue/90 md:text-lg"
          >
            {book.subtitulo}
          </p>
        )}

        {/* Datos del libro */}
        <div className="grid grid-cols-1 gap-4 text-white md:grid-cols-2">
          <div>
            <p className="mb-1">
              <span className="font-bold text-gray-700">
                Código de registro:
              </span>{" "}
              {show(book.codigoRegistro)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">Autor principal:</span>{" "}
              {authorData.principal ?? "—"}
            </p>
            {authorData.otros.length > 0 && (
              <p className="mb-1">
                <span className="font-bold text-gray-700">Otros autores:</span>{" "}
                {authorData.otros.join(", ")}
              </p>
            )}
            <p className="mb-1">
              <span className="font-bold text-gray-700">Colección:</span>{" "}
              {show(book.coleccion)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">Edición:</span>{" "}
              {show(book.numeroEdicion)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">
                Año de publicación:
              </span>{" "}
              {show(book.anioPublicacion)}
            </p>
          </div>

          <div>
            <p className="mb-1">
              <span className="font-bold text-gray-700">Formatos:</span>{" "}
              {showFormatos(book.formato)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">Núm. de páginas:</span>{" "}
              {show(book.numeroPaginas)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">ISBN UG:</span>{" "}
              {show(book.isbn)}
            </p>
            <p className="mb-1">
              <span className="font-bold text-gray-700">Tipo de autoría:</span>{" "}
              {show(book.tipoAutoria)}
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
                className="mt-1 block text-sm text-gray-100/90"
              >
                {show(book.sinopsis)}
              </span>
            </p>
          </div>
        </div>

        {/* Portada (link a página completa) + tooltip */}
        <div className="mt-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => router.push(`/libro/${book.id_libro}`)}
            className="group relative rounded-xl border-2 border-blue overflow-hidden transform transition-all duration-200
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40
             hover:-translate-y-0.5 hover:shadow-2xl group-hover:border-yellow group-hover:ring-4 group-hover:ring-yellow/40"
            title="Ver información completa del libro"
            aria-label="Ver información completa del libro"
            aria-describedby={`tooltip-${book.id_libro}`}
          >
            <Image
              src={
                isValidUrl(book.portada)
                  ? book.portada
                  : "/images/default-placeholder.jpg"
              }
              alt={book.titulo}
              width={220}
              height={280}
              className="rounded-xl shadow-xl transition-transform duration-200 group-hover:scale-[1.03] group-hover:brightness-95"
            />

            {/* Tooltip visual */}
            <span
              id={`tooltip-${book.id_libro}`}
              role="tooltip"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-3
               opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
               rounded-md border border-[#1E3A8A]/30 bg-white/95 px-2 py-1
               text-xs font-semibold text-[#1E3A8A] shadow-lg transition"
            >
              Ver información completa del libro
            </span>
          </button>
        </div>

        {/* Botón Cerrar (abajo y centrado) */}
        <div className="mt-6 flex justify-center">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-md border border-[#1E3A8A] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E3A8A] hover:bg-[rgba(30,58,138,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(30,58,138,0.35)] transition-colors"
            title="Cerrar"
            aria-label="Cerrar modal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
