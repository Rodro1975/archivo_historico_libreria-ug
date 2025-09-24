"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// Normaliza string
const norm = (x) => (x ?? "").toString().toLowerCase().trim();

/**
 * Mapear valor existente en BD -> valor EXACTO del <select>
 * Nueva taxonomía de formatos:
 *  - "impreso"
 *  - "Impresión bajo demanda"
 *  - "Electrónico de acceso abierto"
 *  - "Electrónico comercial"
 *  - "Otro"
 *
 * Notas:
 *  - Para datos viejos como "electronico/eléctrónico" genérico o "ambos/mixto"
 *    dejamos "" (sin selección) para no forzar una interpretación.
 *    Si el usuario no toca el campo, NO actualizamos "formato" en BD.
 */
// Reemplaza SOLO esta función en ActualizarLibros
const mapFormatoFromDB = (libro) => {
  const f = (libro?.formato ?? "").toString().toLowerCase().trim();

  if (!f) return "";

  // impresos
  if (f === "impreso") return "impreso";

  // IBD (acepta variantes con o sin paréntesis / acentos / siglas)
  if (
    f === "impresion bajo demanda" ||
    f === "impresión bajo demanda" ||
    f === "impresion bajo demanda (ibd)" ||
    f === "impresión bajo demanda (ibd)" ||
    f === "ibd"
  ) {
    return "Impresión bajo demanda";
  }

  // Electrónico de acceso abierto
  if (
    f === "electronico de acceso abierto" ||
    f === "electrónico de acceso abierto" ||
    f === "ea" ||
    f === "acceso abierto"
  ) {
    return "Electrónico de acceso abierto";
  }

  // Electrónico comercial
  if (
    f === "electronico comercial" ||
    f === "electrónico comercial" ||
    f === "ec" ||
    f === "comercial"
  ) {
    return "Electrónico comercial";
  }

  // Otro
  if (f === "otro") return "Otro";

  // Valores antiguos no mapeables con certeza -> sin selección
  if (
    f === "electronico" ||
    f === "electrónico" ||
    f === "ambos" ||
    f === "mixto"
  ) {
    return "";
  }

  return "";
};

const ActualizarLibros = ({ libro, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigoRegistro: libro?.codigoRegistro ?? "",
      isbn: libro?.isbn ?? "",
      doi: libro?.doi ?? "",
      titulo: libro?.titulo ?? "",
      subtitulo: libro?.subtitulo ?? "",
      coleccion: libro?.coleccion ?? "",
      numeroEdicion: libro?.numeroEdicion ?? "",
      anioPublicacion: libro?.anioPublicacion ?? "",
      numeroPaginas: libro?.numeroPaginas ?? "",
      tipoAutoria: libro?.tipoAutoria ?? "",
      formato: mapFormatoFromDB(libro),
      sinopsis: libro?.sinopsis ?? "",
    },
  });

  const [selectedFile, setSelectedFile] = useState(null); // portada
  const [selectedPDF, setSelectedPDF] = useState(null); // pdf libro completo

  // Autores (solo lectura)
  const [autores, setAutores] = useState({
    principal: "—",
    otros: [],
    coeditores: [],
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!libro?.id_libro) return;
        const { data, error } = await supabase
          .from("libro_autor")
          .select("tipo_autor, autor:autores ( nombre_completo )")
          .eq("libro_id", libro.id_libro);

        if (error) throw error;
        const rows = data || [];

        const getNombre = (r) => r?.autor?.nombre_completo || null;
        const by = (pred) => rows.find((r) => pred(norm(r?.tipo_autor || "")));

        const rPrincipal =
          by((t) => t.includes("principal")) ||
          by((t) => t === "autor") ||
          rows[0];

        const principal = rPrincipal ? getNombre(rPrincipal) : "—";
        const otros = rows
          .map(getNombre)
          .filter(Boolean)
          .filter((n) => norm(n) !== norm(principal));

        const coeditores = rows
          .filter((r) => {
            const t = norm(r?.tipo_autor || "");
            return t === "coeditor" || t.includes("coeditor");
          })
          .map(getNombre)
          .filter(Boolean);

        if (mounted)
          setAutores({ principal: principal || "—", otros, coeditores });
      } catch {
        /* no-op */
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [libro?.id_libro]);

  // Rehidrata cuando cambie "libro"
  useEffect(() => {
    reset({
      codigoRegistro: libro?.codigoRegistro ?? "",
      isbn: libro?.isbn ?? "",
      doi: libro?.doi ?? "",
      titulo: libro?.titulo ?? "",
      subtitulo: libro?.subtitulo ?? "",
      coleccion: libro?.coleccion ?? "",
      numeroEdicion: libro?.numeroEdicion ?? "",
      anioPublicacion: libro?.anioPublicacion ?? "",
      numeroPaginas: libro?.numeroPaginas ?? "",
      tipoAutoria: libro?.tipoAutoria ?? "",
      formato: mapFormatoFromDB(libro),
      sinopsis: libro?.sinopsis ?? "",
    });
  }, [libro, reset]);

  const handleFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);
  const handlePDFChange = (e) => setSelectedPDF(e.target.files?.[0] || null);

  const handleSubmitForm = async (data) => {
    try {
      let imageUrl = libro?.portada || null;
      let pdfUrl = libro?.archivo_pdf || null;

      // Subir portada si cambió
      if (selectedFile) {
        const fileName = `portadas/${Date.now()}-${selectedFile.name}`;
        const { error: storageError } = await supabase.storage
          .from("portadas")
          .upload(fileName, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });
        if (storageError) throw new Error("Error al subir la portada.");
        imageUrl = supabase.storage.from("portadas").getPublicUrl(fileName)
          .data.publicUrl;
      }

      // Subir PDF si cambió
      if (selectedPDF) {
        const pdfName = `libros/${Date.now()}-${selectedPDF.name}`;
        const { error: pdfErr } = await supabase.storage
          .from("libros")
          .upload(pdfName, selectedPDF, {
            cacheControl: "3600",
            upsert: false,
          });
        if (pdfErr) throw new Error("Error al subir el PDF.");
        pdfUrl = supabase.storage.from("libros").getPublicUrl(pdfName)
          .data.publicUrl;
      }

      // Construir payload: NO sobreescribir "formato" si no se selecciona nada
      const payload = {
        codigoRegistro: (data.codigoRegistro || "").trim(),
        isbn: (data.isbn || "").trim(),
        doi: (data.doi || "").trim(),
        titulo: (data.titulo || "").trim(),
        subtitulo: (data.subtitulo || "").trim(),
        coleccion: (data.coleccion || "").trim(),
        numeroEdicion:
          data.numeroEdicion !== "" && data.numeroEdicion !== null
            ? Number(data.numeroEdicion)
            : null,
        anioPublicacion:
          data.anioPublicacion !== "" && data.anioPublicacion !== null
            ? Number(data.anioPublicacion)
            : null,
        numeroPaginas:
          data.numeroPaginas !== "" && data.numeroPaginas !== null
            ? Number(data.numeroPaginas)
            : null,
        tipoAutoria: (data.tipoAutoria || "").trim(),
        sinopsis: (data.sinopsis || "").trim(),
        portada: imageUrl,
        archivo_pdf: pdfUrl,
      };

      // Solo si el usuario eligió un formato de la lista, enviamos el campo
      if ((data.formato || "").trim() !== "") {
        payload.formato = (data.formato || "").trim();
      }

      const { error } = await supabase
        .from("libros")
        .update(payload, { returning: "minimal" })
        .eq("id_libro", libro.id_libro);

      if (error)
        throw new Error(error.message || "Error al actualizar el libro.");

      toastSuccess("Libro actualizado correctamente.");
      onUpdate?.();
      onClose?.();
    } catch (err) {
      console.error("ActualizarLibros error:", err);
      toastError(err?.message || "Ocurrió un error inesperado.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="p-10 xs:p-0 mx-auto w-full">
          <div className="px-5 py-7 text-center">
            <div className="flex justify-center mb-5">
              <Image
                src="/images/escudo-png.png"
                alt="Escudo"
                className="h-20"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="font-black text-3xl mb-5 text-blue">
              Modificar Libro
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5 pb-8"
          >
            {/* Código de Registro */}
            <div>
              <label
                htmlFor="codigoRegistro"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Código de Registro
              </label>
              <input
                type="text"
                {...register("codigoRegistro", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.codigoRegistro ? (
                <p className="text-red-600 text-xs mt-1">Requerido</p>
              ) : null}
            </div>

            {/* ISBN */}
            <div>
              <label
                htmlFor="isbn"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ISBN
              </label>
              <input
                type="text"
                {...register("isbn")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* DOI (opcional) */}
            <div>
              <label
                htmlFor="doi"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                DOI (opcional)
              </label>
              <input
                type="text"
                {...register("doi")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Título */}
            <div>
              <label
                htmlFor="titulo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Título
              </label>
              <input
                type="text"
                {...register("titulo", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.titulo ? (
                <p className="text-red-600 text-xs mt-1">Requerido</p>
              ) : null}
            </div>

            {/* Subtítulo */}
            <div>
              <label
                htmlFor="subtitulo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Subtítulo (opcional)
              </label>
              <input
                type="text"
                {...register("subtitulo")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Colección */}
            <div>
              <label
                htmlFor="coleccion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Colección
              </label>
              <input
                type="text"
                {...register("coleccion")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Edición */}
            <div>
              <label
                htmlFor="numeroEdicion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Edición
              </label>
              <input
                type="number"
                min="0"
                {...register("numeroEdicion")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Año de publicación */}
            <div>
              <label
                htmlFor="anioPublicacion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Año de publicación
              </label>
              <input
                type="number"
                min="0"
                {...register("anioPublicacion")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Núm. páginas */}
            <div>
              <label
                htmlFor="numeroPaginas"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Núm. de páginas
              </label>
              <input
                type="number"
                min="0"
                {...register("numeroPaginas")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Tipo de autoría (alineado con alta) */}
            <div>
              <label
                htmlFor="tipoAutoria"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tipo de autoría
              </label>
              <select
                {...register("tipoAutoria")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">—</option>
                <option value="individual">Individual</option>
                <option value="coautoría">Coautoría</option>
                <option value="colectiva">Colectiva</option>
              </select>
            </div>

            {/* Formato (nueva taxonomía) */}
            <div>
              <label
                htmlFor="formato"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Formato
              </label>
              <select
                {...register("formato")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">—</option>
                <option value="impreso">Impreso</option>
                <option value="Impresión bajo demanda">
                  Impresión bajo demanda
                </option>
                <option value="Electrónico de acceso abierto">
                  Electrónico de acceso abierto
                </option>
                <option value="Electrónico comercial">
                  Electrónico comercial
                </option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Sinopsis */}
            <div className="md:col-span-2">
              <label
                htmlFor="sinopsis"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Sinopsis
              </label>
              <textarea
                rows={4}
                {...register("sinopsis")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Portada */}
            <div>
              <label
                htmlFor="portada"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Portada (imagen)
              </label>
              <input
                type="file"
                id="portada"
                onChange={handleFileChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".jpg,.jpeg,.png"
              />
            </div>

            {/* PDF del libro */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo PDF del libro (completo)
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
            </div>

            {/* Autores (chips, solo lectura) */}
            <div className="md:col-span-2">
              <div className="text-sm text-gray-700 font-bold mb-1">
                Autor principal
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="logo-pill text-blue text-xs whitespace-nowrap">
                  {autores.principal || "—"}
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm text-gray-700 font-bold mb-1">
                Otros autores
              </div>
              <div className="flex flex-wrap gap-2">
                {autores.otros?.length ? (
                  autores.otros.map((n) => (
                    <span
                      key={n}
                      className="logo-pill text-blue text-xs whitespace-nowrap"
                    >
                      {n}
                    </span>
                  ))
                ) : (
                  <span className="text-blue text-xs">—</span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm text-gray-700 font-bold mb-1">
                Coeditores
              </div>
              <div className="flex flex-wrap gap-2">
                {autores.coeditores?.length ? (
                  autores.coeditores.map((n) => (
                    <span
                      key={n}
                      className="logo-pill text-blue text-xs whitespace-nowrap"
                    >
                      {n}
                    </span>
                  ))
                ) : (
                  <span className="text-blue text-xs">—</span>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActualizarLibros;
