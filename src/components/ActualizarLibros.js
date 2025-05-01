"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";

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

      // Obtener la URL pública de la imagen subida
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
        portada: imageUrl, // Asignar la URL de la portada
        archivo_pdf: pdfUrl, // Asignar la URL del PDF
        depositoLegal_pdf: dlpdfUrl, // Asignar la URL del Depósito Legal PDF
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl text-center text-yellow font-bold mb-4">
          Modificar Libro Seleccionado
        </h2>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="mb-4">
            <label
              htmlFor="codigoRegistro"
              className="block text-sm font-medium text-gray-700"
            >
              Código de Registro
            </label>
            <input
              type="text"
              {...register("codigoRegistro", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700"
            >
              ISBN
            </label>
            <input
              type="text"
              {...register("isbn", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="doi"
              className="block text-sm font-medium text-gray-700"
            >
              DOI
            </label>
            <input
              type="text"
              {...register("doi", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700"
            >
              Titulo
            </label>
            <input
              type="text"
              {...register("titulo", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="coleccion"
              className="block text-sm font-medium text-gray-700"
            >
              Colección
            </label>
            <input
              type="text"
              {...register("coleccion", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="numeroEdicion"
              className="block text-sm font-medium text-gray-700"
            >
              Número de Edición
            </label>
            <input
              type="text"
              {...register("numeroEdicion", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="anioPublicacion"
              className="block text-sm font-medium text-gray-700"
            >
              Año de Publicación
            </label>
            <input
              type="text"
              {...register("anioPublicacion", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="numeroPaginas"
              className="block text-sm font-medium text-gray-700"
            >
              Número de Páginas
            </label>
            <input
              type="number"
              {...register("numeroPaginas", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="tiraje_o_ibd"
              className="block text-sm font-medium text-gray-700"
            >
              Tiraje o IBD
            </label>
            <input
              type="text"
              {...register("tiraje_o_ibd", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

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
  );
};

export default ActualizarLibros;
