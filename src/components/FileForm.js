"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TYPE_OPTIONS = [
  { value: "pdf_completo", label: "PDF del libro" },
  { value: "deposito_legal", label: "Depósito legal" },
  { value: "editables", label: "Editables" },
  { value: "ficha_isbn", label: "Ficha ISBN" },
  { value: "dictamenes", label: "Dictámenes" },
  { value: "aval_publicacion", label: "Aval de publicación" },
  { value: "contrato", label: "Contrato" },
  { value: "derechos_autor", label: "Derechos de autor" },
  { value: "reporte_antiplagio", label: "Reporte antiplagio" },
  { value: "otro", label: "Otro" },
];

// Tipos “únicos” por libro (bloqueo de duplicado)
const SINGLETON_TYPES = new Set([
  "pdf_completo",
  "deposito_legal",
  "ficha_isbn",
  "aval_publicacion",
  "contrato",
  "derechos_autor",
  "reporte_antiplagio",
]);

export default function FileForm() {
  const router = useRouter();
  const [libros, setLibros] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      libro_id: "",
      tipo: "",
      nota: "",
      url: "",
    },
  });

  const tipoWatch = watch("tipo");

  useEffect(() => {
    supabase
      .from("libros")
      .select("id_libro, codigoRegistro, titulo")
      .order("codigoRegistro", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setLibros([]);
        } else {
          setLibros(data || []);
        }
      });
  }, []);

  const onSubmit = async (data) => {
    try {
      const libroId = Number(data.libro_id);
      const tipoSel = (data.tipo || "").trim();
      const nota = (data.nota || "").trim();
      const urlVal = (data.url || "").trim();

      if (!libroId) {
        toastError("Debes seleccionar un libro.");
        return;
      }
      if (!tipoSel) {
        toastError("Debes seleccionar un tipo de expediente.");
        return;
      }
      if (!selectedFile && !urlVal) {
        toastError("Sube un archivo o proporciona una URL.");
        return;
      }
      if (selectedFile && urlVal) {
        toastError("Elige solo archivo o solo URL (no ambos).");
        return;
      }

      // Pre-check para tipos únicos
      if (SINGLETON_TYPES.has(tipoSel)) {
        const { data: exist, error: e1 } = await supabase
          .from("libro_adjuntos")
          .select("id")
          .eq("libro_id", libroId)
          .eq("tipo", tipoSel)
          .limit(1);
        if (e1) throw e1;
        if (exist && exist.length) {
          toastError("Ya existe un expediente de este tipo para el libro.");
          return;
        }
      }

      // Subida a Storage (si hay archivo) o guardado de URL externa
      let origen = selectedFile ? "upload" : "url"; // 👈 clave para pasar el CHECK
      let storage_path = null;
      let mime_type = null;
      let size_bytes = null;
      let urlToSave = urlVal || null;

      if (selectedFile) {
        setUploading(true);
        const safeName = selectedFile.name.replace(/\s+/g, "_");
        const path = `libros/${libroId}/${tipoSel}/${Date.now()}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from("expedientes")
          .upload(path, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });
        if (upErr) throw upErr;

        storage_path = path;
        mime_type = selectedFile.type || null;
        size_bytes = selectedFile.size || null;
        urlToSave = null; // bucket privado → no guardamos URL pública
        setUploading(false);
      }

      // Validación de consistencia con el CHECK (opcional, pero útil)
      if (origen === "upload") {
        if (!storage_path || urlToSave !== null) {
          toastError(
            "Inconsistencia: para origen=upload debe existir archivo y NO URL."
          );
          return;
        }
      } else if (origen === "url") {
        if (!urlToSave || storage_path !== null) {
          toastError(
            "Inconsistencia: para origen=url debe existir URL y NO archivo."
          );
          return;
        }
      }

      // Auditoría (opcional): quién sube
      let uploaded_by = null;
      try {
        const { data: auth } = await supabase.auth.getUser();
        uploaded_by = auth?.user?.id ?? null;
      } catch {}

      // Armado de payload
      const payload = {
        libro_id: libroId,
        tipo: tipoSel, // 'pdf_completo', 'deposito_legal', etc.
        origen, // 'upload' | 'url'
        storage_path, // si subiste archivo
        url: urlToSave, // si es enlace externo
        titulo: null, // opcional a futuro
        notas: nota || null,
        mime_type,
        size_bytes,
        uploaded_by,
      };

      // Insert + redirect
      const { error } = await supabase
        .from("libro_adjuntos")
        .insert(payload)
        .single();
      if (error) throw error;

      toastSuccess("Expediente registrado correctamente.");
      reset();
      setSelectedFile(null);
      router.push(`/mostrarExpedientes?libro=${libroId}`);
    } catch (e) {
      console.error(e);
      toastError(e.message || "No se pudo registrar el expediente.");
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-4xl rounded-lg shadow-lg">
        <div className="p-10 xs:p-0 mx-auto w-full">
          {/* Header unificado: escudo + título */}
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
              Subir Expedientes
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5 pb-8"
          >
            {/* Libro */}
            <div className="mb-4 md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Libro*
              </label>
              <select
                {...register("libro_id")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">— Selecciona un libro —</option>
                {libros.map((l) => (
                  <option key={l.id_libro} value={l.id_libro}>
                    {l.codigoRegistro} — {l.titulo}
                  </option>
                ))}
              </select>
              {errors.libro_id && (
                <p className="text-red-500 text-xs">Campo requerido</p>
              )}
            </div>

            {/* Tipo */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo*
              </label>
              <select
                {...register("tipo")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full bg-white"
              >
                <option value="">— Selecciona un tipo —</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nota */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nota (opcional)
              </label>
              <input
                type="text"
                {...register("nota")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Descripción corta"
              />
            </div>

            {/* Archivo */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo (opcional)
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept="application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
              />
            </div>

            {/* URL */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                URL (opcional)
              </label>
              <input
                type="url"
                {...register("url")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="https://…"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={uploading}
                className="transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                {uploading ? "Subiendo…" : "Registrar expediente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
