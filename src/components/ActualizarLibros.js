"use client";

import { useEffect } from "react";
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

  //efecto para reiniciar el formulario cuando se actualiza un libro
  useEffect(() => {
    reset(libro);
  }, [libro, reset]);

  const handleSubmitForm = async (data) => {
    const { error } = await supabase
      .from("libros")
      .update(data)
      .eq("id_libro", libro.id_libro);

    if (error) {
      console.error("Error al actualizar el formulario", error.message);
    } else {
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
              className="block text-sm font-medium text-gray-700"
            >
              Portada
            </label>
            <input
              type="text"
              {...register("portada", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="archivo_pdf"
              className="block text-sm font-medium text-gray-700"
            >
              Archivo PDF
            </label>
            <input
              type="text"
              {...register("archivo_pdf", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="depositoLegal_pdf"
              className="block text-sm font-medium text-gray-700"
            >
              Deposito Legal PDF
            </label>
            <input
              type="text"
              {...register("depositoLegal_pdf", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
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
