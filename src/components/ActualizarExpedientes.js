// src/components/ActualizarExpedientes.js
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { FaExternalLinkAlt } from "react-icons/fa";
// Etiquetas legibles para los tipos de expediente
const TYPE_LABELS = {
  pdf_completo: "PDF del libro",
  deposito_legal: "Depósito legal",
  editables: "Editables",
  ficha_isbn: "Ficha ISBN",
  dictamenes: "Dictámenes",
  aval_publicacion: "Aval de publicación",
  contrato: "Contrato",
  derechos_autor: "Derechos de autor",
  reporte_antiplagio: "Reporte antiplagio",
  otro: "Otro",
};
// Componente principal
export default function ActualizarExpedientes({ row, onClose, onUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      libro_id: row?.libro_id ?? "",
      tipo: row?.tipo ?? "",
      nota: row?.notas ?? "",
      url: row?.url ?? "",
    },
  });
  // Sincroniza los valores del formulario cuando cambia la fila
  useEffect(() => {
    reset({
      libro_id: row?.libro_id ?? "",
      tipo: row?.tipo ?? "",
      nota: row?.notas ?? "",
      url: row?.url ?? "",
    });
  }, [row, reset]);

  const urlVal = watch("url");
  // Función para abrir el expediente actual
  const openActual = async () => {
    try {
      if (row?.origen === "url" && row?.url) {
        window.open(row.url, "_blank");
        return;
      }
      if (row?.origen === "upload" && row?.storage_path) {
        const { data, error } = await supabase.storage
          .from("expedientes")
          .createSignedUrl(row.storage_path, 60);
        if (error) throw error;
        window.open(data.signedUrl, "_blank");
        return;
      }
      toastError("No hay archivo ni URL disponible.");
    } catch (e) {
      console.error(e);
      toastError("No se pudo abrir el expediente.");
    }
  };
  // Función para manejar el envío del formulario
  const onSubmit = async (data) => {
    try {
      const libroId = Number(data.libro_id);
      const tipo = (data.tipo || "").trim();
      const nota = (data.nota || "").trim();
      const newUrl = (data.url || "").trim();

      if (!libroId || !tipo) {
        toastError("Datos inválidos del expediente.");
        return;
      }

      // Validaciones de exclusión
      if (selectedFile && newUrl) {
        toastError("Elige solo archivo o solo URL (no ambos).");
        return;
      }

      let updatePayload = {
        notas: nota || null,
      };

      // Si carga archivo nuevo → sube a Storage y setea origen=upload
      if (selectedFile && !newUrl) {
        setUploading(true);
        const safeName = selectedFile.name.replace(/\s+/g, "_");
        const path = `libros/${libroId}/${tipo}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("expedientes")
          .upload(path, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });
        if (upErr) throw upErr;

        updatePayload = {
          ...updatePayload,
          origen: "upload",
          storage_path: path,
          url: null,
          mime_type: selectedFile.type || null,
          size_bytes: selectedFile.size || null,
        };

        setUploading(false);
      }

      // Si pone URL nueva → setea origen=url y limpia storage_path
      if (!selectedFile && newUrl) {
        updatePayload = {
          ...updatePayload,
          origen: "url",
          url: newUrl,
          storage_path: null,
          mime_type: null,
          size_bytes: null,
        };
      }

      // Si no cambió ni archivo ni URL, solo actualiza la nota
      const { error } = await supabase
        .from("libro_adjuntos")
        .update(updatePayload)
        .eq("id", row.id);

      if (error) throw error;

      toastSuccess("Expediente actualizado correctamente.");
      onUpdate?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      toastError(e.message || "No se pudo actualizar el expediente.");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-4xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
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
              Modificar Expediente
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 px-5 pb-8"
          >
            {/* Libro (solo lectura) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Libro
              </label>
              <input
                type="text"
                disabled
                value={`${row?.libros?.codigoRegistro ?? "—"} — ${
                  row?.libros?.titulo ?? "—"
                }`}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue bg-gray-200 w-full"
              />
            </div>

            {/* Tipo (solo lectura) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo
              </label>
              <input
                type="text"
                disabled
                value={TYPE_LABELS[row?.tipo] || row?.tipo || "—"}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue bg-gray-200 w-full"
              />
            </div>

            {/* Nota */}
            <div className="md:col-span-2">
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

            {/* Archivo nuevo (opcional) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Reemplazar con archivo (opcional)
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept="application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
              />
            </div>

            {/* URL nueva (opcional) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Reemplazar con URL (opcional)
              </label>
              <input
                type="url"
                {...register("url")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="https://…"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si proporcionas URL, se ignora el archivo y se guardará como
                origen <strong>url</strong>.
              </p>
            </div>

            {/* Archivo/URL actual + abrir */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openActual}
                  className="flex items-center gap-2 bg-blue hover:bg-blue-700 shadow-md hover:shadow-lg text-white px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                  title="Abrir actual"
                >
                  <FaExternalLinkAlt />
                  Abrir actual
                </button>
                <span className="text-sm text-gray-700">
                  Origen actual:{" "}
                  <strong className="uppercase">{row?.origen || "—"}</strong>
                  {row?.origen === "upload" && row?.storage_path
                    ? ` — ${row.storage_path}`
                    : null}
                  {row?.origen === "url" && row?.url ? ` — ${row.url}` : null}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                {uploading ? "Subiendo…" : "Guardar cambios"}
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
}
