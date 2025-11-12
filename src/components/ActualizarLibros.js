"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// Normaliza string
const norm = (x) => (x ?? "").toString().toLowerCase().trim();

//Boolean es traduccion
const mapEsTraduccionFromDB = (libro) => {
  const v =
    libro?.esTraduccion ??
    libro?.es_traduccion ??
    libro?.traduccion ??
    libro?.es_traducción ??
    null;
  if (typeof v === "boolean") return v;
  const s = (v ?? "").toString().toLowerCase().trim();
  return s === "1" || s === "true" || s === "sí" || s === "si" || s === "yes";
};

/**
 * Mapear valor existente en BD -> valor EXACTO del <select> formato
 */
const mapFormatoFromDB = (libro) => {
  const f = (libro?.formato ?? "").toString().toLowerCase().trim();
  if (!f) return "";
  if (f === "impreso") return "impreso";
  if (
    f === "impresion bajo demanda" ||
    f === "impresión bajo demanda" ||
    f === "impresion bajo demanda (ibd)" ||
    f === "impresión bajo demanda (ibd)" ||
    f === "ibd"
  )
    return "Impresión bajo demanda";
  if (
    f === "electronico de acceso abierto" ||
    f === "electrónico de acceso abierto" ||
    f === "ea" ||
    f === "acceso abierto"
  )
    return "Electrónico de acceso abierto";
  if (
    f === "electronico comercial" ||
    f === "electrónico comercial" ||
    f === "ec" ||
    f === "comercial"
  )
    return "Electrónico comercial";
  if (f === "otro") return "Otro";
  if (["electronico", "electrónico", "ambos", "mixto"].includes(f)) return "";
  return "";
};
// Componente ActualizarLibros
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
      materia: libro?.materia ?? "",
      tematica: libro?.tematica ?? "",
      coleccion: libro?.coleccion ?? "",
      numeroEdicion: libro?.numeroEdicion ?? "",
      anioPublicacion: libro?.anioPublicacion ?? "",
      numeroPaginas: libro?.numeroPaginas ?? "",
      tipoAutoria: libro?.tipoAutoria ?? "",
      formato: mapFormatoFromDB(libro),
      sinopsis: libro?.sinopsis ?? "",
      tiraje_o_ibd: libro?.tiraje_o_ibd ?? "",
      idioma: libro?.idioma ?? "",
      esTraduccion: mapEsTraduccionFromDB(libro),
      selectedAutorId: "", // ← se precargará en el useEffect
      selectedCoautorIds: [],
    },
  });

  const [selectedFile, setSelectedFile] = useState(null); // portada
  const [selectedPDF, setSelectedPDF] = useState(null); // pdf libro completo

  // Autores  + opciones para select)
  const [autores, setAutores] = useState({
    principal: "—",
    otros: [],
    coeditores: [],
  });

  const [autoresOptions, setAutoresOptions] = useState([]);

  // Cargar relaciones autor/libro y precargar selectedAutorId
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!libro?.id_libro) return;

        // Traer relaciones con autor_id
        const { data: rels, error: relErr } = await supabase
          .from("libro_autor")
          .select("tipo_autor, autor_id, autor:autores ( id, nombre_completo )")
          .eq("libro_id", libro.id_libro);

        if (relErr) throw relErr;
        const rows = rels || [];

        // IDs de coautores actuales (para precargar el multiselect)
        const coautorIds = rows
          .filter((r) => norm(r?.tipo_autor || "").includes("coautor"))
          .map((r) => r.autor_id)
          .filter(Boolean);
        // Autor principal por tipo_autor
        const by = (pred) => rows.find((r) => pred(norm(r?.tipo_autor || "")));
        const rPrincipal =
          by((t) => t.includes("principal")) ||
          by((t) => t === "autor") ||
          rows[0];

        const principalNombre = rPrincipal?.autor?.nombre_completo || "—";
        const principalId = rPrincipal?.autor_id ?? null;

        const getNombre = (r) => r?.autor?.nombre_completo || null;
        const otros = rows
          .map(getNombre)
          .filter(Boolean)
          .filter((n) => norm(n) !== norm(principalNombre));

        const coeditores = rows
          .filter((r) => {
            const t = norm(r?.tipo_autor || "");
            return t === "coeditor" || t.includes("coeditor");
          })
          .map(getNombre)
          .filter(Boolean);

        if (mounted) {
          setAutores({
            principal: principalNombre || "—",
            otros,
            coeditores,
          });
        }

        // Traer opciones de autores para el select
        const { data: autoresData, error: autoresErr } = await supabase
          .from("autores")
          .select("id, nombre_completo")
          .order("nombre_completo", { ascending: true });

        if (autoresErr) throw autoresErr;
        if (mounted) setAutoresOptions(autoresData || []);

        // Rehidratar form incluyendo selectedAutorId
        if (mounted) {
          reset({
            codigoRegistro: libro?.codigoRegistro ?? "",
            isbn: libro?.isbn ?? "",
            doi: libro?.doi ?? "",
            titulo: libro?.titulo ?? "",
            subtitulo: libro?.subtitulo ?? "",
            materia: libro?.materia ?? "",
            tematica: libro?.tematica ?? "",
            coleccion: libro?.coleccion ?? "",
            numeroEdicion: libro?.numeroEdicion ?? "",
            anioPublicacion: libro?.anioPublicacion ?? "",
            numeroPaginas: libro?.numeroPaginas ?? "",
            tipoAutoria: libro?.tipoAutoria ?? "",
            formato: mapFormatoFromDB(libro),
            sinopsis: libro?.sinopsis ?? "",
            tiraje_o_ibd: libro?.tiraje_o_ibd ?? "",
            idioma: libro?.idioma ?? "",
            esTraduccion: mapEsTraduccionFromDB(libro),
            selectedAutorId: principalId ? String(principalId) : "",
            selectedCoautorIds: coautorIds.map(String),
          });
        }
      } catch (e) {
        // opcional: toastError("No se pudieron cargar autores.");
        console.error(e);
      }
    };

    load();
    return () => {
      mounted = false;
    };
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

      // Subir PDF si cambió (opcional)
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

      // Construir payload de libros
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

      // Update libros
      const { error } = await supabase
        .from("libros")
        .update(payload, { returning: "minimal" })
        .eq("id_libro", libro.id_libro);

      if (error)
        throw new Error(error.message || "Error al actualizar el libro.");

      // --- Actualizar coautores ---
      const selCoIds = Array.isArray(data.selectedCoautorIds)
        ? data.selectedCoautorIds
            .map((v) => parseInt(String(v), 10))
            .filter(Boolean)
        : [];

      // Evitar que el autor principal quede duplicado como coautor
      const principalIdInt = data.selectedAutorId
        ? parseInt(String(data.selectedAutorId), 10)
        : null;
      const finalCoIds = selCoIds.filter((id) => id && id !== principalIdInt);

      // 1) Borrar coautores actuales (cubrimos variantes de etiqueta)
      const { error: delCoErr } = await supabase
        .from("libro_autor")
        .delete()
        .eq("libro_id", libro.id_libro)
        .or(
          "tipo_autor.eq.coautor,tipo_autor.eq.coautoría,tipo_autor.eq.coautoria"
        );

      if (delCoErr) throw delCoErr;

      // 2) Insertar nuevos coautores (si hay)
      if (finalCoIds.length) {
        const relaciones = finalCoIds.map((id) => ({
          libro_id: libro.id_libro,
          autor_id: id,
          tipo_autor: "coautor",
        }));

        const { error: insCoErr } = await supabase
          .from("libro_autor")
          .insert(relaciones);

        if (insCoErr)
          throw new Error("No fue posible actualizar los coautores.");
      }

      // Update autor principal si se seleccionó uno
      if (data.selectedAutorId && String(data.selectedAutorId).trim() !== "") {
        const nuevoAutorId = parseInt(String(data.selectedAutorId), 10);

        // Eliminar autor principal actual (cubrimos variantes)
        const { error: delErr } = await supabase
          .from("libro_autor")
          .delete()
          .eq("libro_id", libro.id_libro)
          .in("tipo_autor", ["autor", "autor principal", "principal"]);

        if (delErr) throw delErr;

        // Insertar nuevo autor principal
        const { error: insErr } = await supabase.from("libro_autor").insert({
          libro_id: libro.id_libro,
          autor_id: nuevoAutorId,
          tipo_autor: "autor",
        });

        if (insErr)
          throw new Error("No fue posible actualizar el autor principal.");
      }

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
            {/* Autor principal (editable) */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Autor principal
              </label>
              <select
                {...register("selectedAutorId")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">— Selecciona un autor —</option>
                {(autoresOptions || []).map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            {/* Coautores (editable) */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Coautores (selección múltiple)
              </label>
              <select
                multiple
                {...register("selectedCoautorIds")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white h-36"
              >
                {(autoresOptions || []).map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.nombre_completo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mantén Ctrl/Cmd para seleccionar varios.
              </p>
            </div>

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

            {/* Materia */}
            <div>
              <label
                htmlFor="materia"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Materia
              </label>
              <input
                type="text"
                id="materia"
                {...register("materia")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Temática */}
            <div>
              <label
                htmlFor="tematica"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Temática
              </label>
              <input
                type="text"
                id="tematica"
                {...register("tematica")}
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

            {/* Tiraje o IBD (opcional) */}
            <div>
              <label
                htmlFor="tiraje_o_ibd"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tiraje o IBD
              </label>
              <input
                type="text"
                id="tiraje_o_ibd"
                {...register("tiraje_o_ibd")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Idioma (opcional, select) */}
            <div>
              <label
                htmlFor="idioma"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Idioma
              </label>
              <select
                id="idioma"
                {...register("idioma")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">—</option>
                <option value="español">Español</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="portugues">Portugués</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Es traducción (booleano) */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="esTraduccion"
                {...register("esTraduccion")}
                className="h-5 w-5 text-blue-600"
              />
              <label
                htmlFor="esTraduccion"
                className="text-sm text-gray-700 font-bold"
              >
                Es traducción al Español
              </label>
            </div>

            {/* Tipo de autoría */}
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

            {/* Formato */}
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
              {libro?.portada ? (
                <div className="text-xs text-blue mt-1 break-words">
                  Actual: {libro.portada}
                </div>
              ) : null}
            </div>

            {/* PDF del libro */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo PDF del libro (opcional)
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
              {libro?.archivo_pdf ? (
                <div className="text-xs text-blue mt-1 break-words">
                  Actual: {libro.archivo_pdf}
                </div>
              ) : null}
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
