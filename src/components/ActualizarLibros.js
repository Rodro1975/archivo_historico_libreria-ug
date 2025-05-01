"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";

const ActualizarLibros = ({ libro, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: libro,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedDLPDF, setSelectedDLPDF] = useState(null);

  // Efecto para reiniciar el formulario cuando se actualiza un libro
  useEffect(() => {
    reset(libro);
  }, [libro, reset]);

  // Funciones para manejar los archivos
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handlePDFChange = (event) => {
    setSelectedPDF(event.target.files[0]);
  };

  const handleDLPDFChange = (event) => {
    setSelectedDLPDF(event.target.files[0]);
  };

  const handleSubmitForm = async (data) => {
    let imageUrl = libro.portada;
    let pdfUrl = libro.archivo_pdf;
    let dlpdfUrl = libro.depositoLegal_pdf;

    // Subir la foto de portada a Supabase
    if (selectedFile) {
      const fileName = `portadas/${Date.now()}-${selectedFile.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("portadas")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Error al subir la portada:", storageError);
        return;
      }

      imageUrl = supabase.storage.from("portadas").getPublicUrl(fileName)
        .data.publicUrl;
    }

    // Subir el PDF a Supabase
    if (selectedPDF) {
      const pdfFileName = `libros/${Date.now()}-${selectedPDF.name}`;
      const { data: pdfStorageData, error: pdfStorageError } =
        await supabase.storage.from("libros").upload(pdfFileName, selectedPDF, {
          cacheControl: "3600",
          upsert: false,
        });

      if (pdfStorageError) {
        console.error("Error al subir el PDF:", pdfStorageError);
        return;
      }

      pdfUrl = supabase.storage.from("libros").getPublicUrl(pdfFileName)
        .data.publicUrl;
    }

    // Subir el Depósito Legal PDF a Supabase
    if (selectedDLPDF) {
      const dlpdfFileName = `depositolegal/${Date.now()}-${selectedDLPDF.name}`;
      const { data: pdfStorageData, error: dlpdfStorageError } =
        await supabase.storage
          .from("depositolegal")
          .upload(dlpdfFileName, selectedDLPDF, {
            cacheControl: "3600",
            upsert: false,
          });

      if (dlpdfStorageError) {
        console.error("Error al subir el PDF:", dlpdfStorageError);
        return;
      }

      dlpdfUrl = supabase.storage
        .from("depositolegal")
        .getPublicUrl(dlpdfFileName).data.publicUrl;
    }

    // Actualizar en la base de datos
    const { error } = await supabase
      .from("libros")
      .update({
        ...data,
        portada: imageUrl,
        archivo_pdf: pdfUrl,
        depositoLegal_pdf: dlpdfUrl,
      })
      .eq("id_libro", libro.id_libro);

    if (error) {
      console.error("Error al actualizar el formulario:", error.message);
      alert("Error al actualizar el formulario. Verifica tus permisos.");
    } else {
      alert("Libro actualizado correctamente.");
      onUpdate();
      onClose();
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
            <h1 className="font-black text-3xl mb-5 text-gold">
              Actualizar Libro
            </h1>
          </div>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Código de Registro */}
            <div className="mb-4">
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
            </div>

            {/* ISBN */}
            <div className="mb-4">
              <label
                htmlFor="isbn"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ISBN
              </label>
              <input
                type="text"
                {...register("isbn", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* DOI */}
            <div className="mb-4">
              <label
                htmlFor="doi"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                DOI
              </label>
              <input
                type="text"
                {...register("doi", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Título */}
            <div className="mb-4">
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
            </div>

            {/* Colección */}
            <div className="mb-4">
              <label
                htmlFor="coleccion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Colección
              </label>
              <input
                type="text"
                {...register("coleccion", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus;border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Número Edición */}
            <div className="mb-4">
              <label
                htmlFor="numeroEdicion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Número de Edición
              </label>
              <input
                type="text"
                {...register("numeroEdicion", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus;border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Año Publicación */}
            <div className="mb-4">
              <label
                htmlFor="anioPublicacion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Año de Publicación
              </label>
              <input
                type="text"
                {...register("anioPublicacion", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus;border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Número Páginas */}
            <div className="mb-4">
              <label
                htmlFor="numeroPaginas"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Número de Páginas
              </label>
              <input
                type="number"
                {...register("numeroPaginas", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus;border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Tiraje o IBD */}
            <div className="mb-4">
              <label
                htmlFor="tiraje_o_ibd"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tiraje o IBD
              </label>
              <input
                type="text"
                {...register("tiraje_o_ibd", { required: true })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus;border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
            </div>

            {/* Portada */}
            <div className="mb-4">
              <label
                htmlFor="portada"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Portada
              </label>
              <input
                type="file"
                id="portada"
                onChange={handleFileChange} // Se cambia a manejar el archivo directamente
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".jpg, .jpeg, .png"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo PDF
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo Deposito Legal PDF
              </label>
              <input
                type="file"
                onChange={handleDLPDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
            </div>
            {/* Agrega más campos según sea necesario */}

            {/* Botones para guardar cambios y cancelar */}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-1 rounded ml-2 hover:bg-red-700"
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActualizarLibros;
