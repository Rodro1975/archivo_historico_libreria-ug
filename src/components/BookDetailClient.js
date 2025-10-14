"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaFilePdf } from "react-icons/fa";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";

export default function BookDetailClient({ id: propId }) {
  const params = useParams();
  const search = useSearchParams();

  // ID robusto: prop > URL
  const id = useMemo(() => propId ?? params?.id ?? null, [propId, params]);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [autorPrincipal, setAutorPrincipal] = useState(null);

  // helpers
  const show = (v) =>
    v === null || v === undefined || (typeof v === "string" && v.trim() === "")
      ? "—"
      : v;

  const normalizeFormato = (f) => {
    if (!f) return "—";
    const v = String(f).toLowerCase();
    if (v.includes("impresión bajo demanda") || v === "ibd")
      return "Impresión bajo demanda";
    if (v.includes("acceso abierto")) return "Electrónico de acceso abierto";
    if (v.includes("electrónico") || v.includes("electronico"))
      return "Electrónico";
    if (v.includes("impreso")) return "Impreso";
    return f;
  };

  useEffect(() => {
    let mounted = true;

    async function fetchBook() {
      if (!id) {
        setLoading(false);
        setErrorMsg("ID de libro inválido.");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("libros")
          .select(
            `
            id_libro,
            titulo,
            subtitulo,
            sinopsis,
            isbn,
            doi,
            codigoRegistro,
            coleccion,
            numeroEdicion,
            anioPublicacion,
            formato,
            tipoAutoria,
            numeroPaginas,
            idioma,
            tiraje_o_ibd,
            esTraduccion,
            materia,
            tematica,
            portada,
            archivo_pdf
          `
          )
          .eq("id_libro", Number(id))
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Libro no encontrado.");

        if (mounted) {
          setBook(data);
          setErrorMsg("");
        }

        // Cargar autor principal
        if (data?.id_libro) {
          const { data: rels, error: relErr } = await supabase
            .from("libro_autor")
            .select(`tipo_autor, autor:autores ( id, nombre_completo )`)
            .eq("libro_id", data.id_libro);

          if (!relErr && Array.isArray(rels)) {
            const rows = rels.filter((r) => r.autor?.nombre_completo);
            const isRole = (row, re) =>
              (row?.tipo_autor || "").toString().toLowerCase().match(re);

            const principalRow =
              rows.find((r) => isRole(r, /principal/)) ||
              rows.find((r) => isRole(r, /^autor$/)) ||
              rows[0];

            setAutorPrincipal(principalRow?.autor?.nombre_completo || null);
          } else {
            setAutorPrincipal(null);
          }
        } else {
          setAutorPrincipal(null);
        }
      } catch (e) {
        if (mounted) setErrorMsg(e.message || "Error cargando el libro.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBook();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        Cargando libro…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-200">
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* WorkBar fija arriba */}
      <div className="sticky top-0 z-50">
        <WorkBar />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 md:pt-28 pb-10 text-white">
        {/* Cabecera */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            {book.titulo}
          </h1>
          {book.subtitulo ? (
            <p className="text-white/80 mt-2">{book.subtitulo}</p>
          ) : null}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portada + acciones */}
          <aside className="relative">
            <div className="relative mx-auto w-full max-w-sm">
              {/* halo decorativo */}
              <div
                className="absolute -inset-3 rounded-3xl opacity-30 blur-2xl"
                style={{
                  background:
                    "radial-gradient(120px 120px at 30% 30%, rgba(255,215,0,0.55), transparent 60%), radial-gradient(140px 140px at 70% 70%, rgba(255,165,0,0.45), transparent 60%)",
                }}
              />
              <div className="relative rounded-2xl border-2 border-[rgba(255,215,0,0.75)] shadow-xl overflow-hidden will-change-transform">
                <Image
                  src={book.portada || "/images/default-placeholder.jpg"}
                  alt={book.titulo}
                  width={640}
                  height={900}
                  unoptimized
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Botón PDF (ghost) */}
            <div className="mt-5 flex flex-wrap gap-3">
              {book.archivo_pdf ? (
                <a
                  href={book.archivo_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir PDF en nueva pestaña"
                  className="inline-flex items-center gap-2 rounded-md border border-[#D32F2F] bg-white px-5 py-2.5 text-sm font-semibold text-[#D32F2F] hover:bg-[rgba(211,47,47,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(211,47,47,0.35)] transition-colors"
                >
                  <FaFilePdf className="text-[#D32F2F]" />
                  Leer libro (PDF)
                </a>
              ) : null}
            </div>
          </aside>

          {/* Datos */}
          <section className="space-y-8">
            {/* Autoría */}
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <h2 className="text-xl font-bold mb-4 text-yellow-300">
                Autoría
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                <dt className="text-yellow-300 font-semibold">
                  Autor principal
                </dt>
                <dd className="text-white/90">{show(autorPrincipal)}</dd>

                <dt className="text-yellow-300 font-semibold">
                  Tipo de autoría
                </dt>
                <dd className="text-white/90">{show(book.tipoAutoria)}</dd>

                <dt className="text-yellow-300 font-semibold">Traducción</dt>
                <dd className="text-white/90">
                  {book.esTraduccion ? "Sí (al español)" : "No"}
                </dd>
              </dl>
            </div>

            {/* Ficha técnica */}
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
              <h2 className="text-xl font-bold mb-4 text-yellow-300">
                Ficha técnica
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                <dt className="text-yellow-300 font-semibold">Código</dt>
                <dd className="text-white/90">{show(book.codigoRegistro)}</dd>

                <dt className="text-yellow-300 font-semibold">ISBN</dt>
                <dd className="text-white/90">{show(book.isbn)}</dd>

                {book.doi ? (
                  <>
                    <dt className="text-yellow-300 font-semibold">DOI</dt>
                    <dd className="text-white/90">{show(book.doi)}</dd>
                  </>
                ) : null}

                <dt className="text-yellow-300 font-semibold">Colección</dt>
                <dd className="text-white/90">{show(book.coleccion)}</dd>

                <dt className="text-yellow-300 font-semibold">Edición</dt>
                <dd className="text-white/90">{show(book.numeroEdicion)}</dd>

                <dt className="text-yellow-300 font-semibold">Año</dt>
                <dd className="text-white/90">{show(book.anioPublicacion)}</dd>

                <dt className="text-yellow-300 font-semibold">Formato</dt>
                <dd className="text-white/90">
                  {normalizeFormato(book.formato)}
                </dd>

                <dt className="text-yellow-300 font-semibold">Páginas</dt>
                <dd className="text-white/90">{show(book.numeroPaginas)}</dd>

                <dt className="text-yellow-300 font-semibold">Idioma</dt>
                <dd className="text-white/90">{show(book.idioma)}</dd>

                {book.tiraje_o_ibd ? (
                  <>
                    <dt className="text-yellow-300 font-semibold">
                      Tiraje / IBD
                    </dt>
                    <dd className="text-white/90">{show(book.tiraje_o_ibd)}</dd>
                  </>
                ) : null}
              </dl>
            </div>

            {/* Clasificación */}
            {(book.materia || book.tematica) && (
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
                <h2 className="text-xl font-bold mb-4 text-yellow-300">
                  Clasificación
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                  {book.materia ? (
                    <>
                      <dt className="text-yellow-300 font-semibold">Materia</dt>
                      <dd className="text-white/90">{show(book.materia)}</dd>
                    </>
                  ) : null}
                  {book.tematica ? (
                    <>
                      <dt className="text-yellow-300 font-semibold">
                        Temática
                      </dt>
                      <dd className="text-white/90">{show(book.tematica)}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
            )}
          </section>
        </div>

        {/* Sinopsis (full width) */}
        <section className="mt-8 rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
          <h2 className="text-xl font-bold mb-3 text-yellow-300">Sinopsis</h2>
          <p className="text-white/90 leading-relaxed">{show(book.sinopsis)}</p>
        </section>
      </div>
    </div>
  );
}
