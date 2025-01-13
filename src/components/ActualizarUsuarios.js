"use client";

"use client";

import { useEffect, useState } from "react"; // Solo una vez
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";

const ActualizarUsuarios = ({ usuario, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: usuario,
  });

  //efecto para reiniciar el formulario cuando se actualiza un usuario
  useEffect(() => {
    reset(usuario); // Reinicia el formulario cuando el usuario cambia
  }, [usuario, reset]);

  const handleSubmitForm = async (data) => {
    const { error } = await supabase
      .from("usuarios")
      .update(data)
      .eq("id_usuario", usuario.id_usuario);

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
          Modificar Usuario Seleccionado
        </h2>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="mb-4">
            <label
              htmlFor="primer_nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Primer Nombre
            </label>
            <input
              type="text"
              {...register("primer_nombre", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="segundo_nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Segundo Nombre
            </label>
            <input
              type="text"
              {...register("segundo_nombre", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="apellido_paterno"
              className="block text-sm font-medium text-gray-700"
            >
              Apellido Paterno
            </label>
            <input
              type="text"
              {...register("apellido_paterno", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="apellido_materno"
              className="block text-sm font-medium text-gray-700"
            >
              Apellido Materno
            </label>
            <input
              type="text"
              {...register("apellido_materno", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              type="text"
              {...register("telefono", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="pasword"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="text"
              {...register("pasword", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Rol
            </label>
            <input
              type="text"
              {...register("role", { required: true })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="foto"
              className="block text-sm font-medium text-gray-700"
            >
              Foto
            </label>
            <input
              type="text"
              {...register("foto", { required: true })}
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

export default ActualizarUsuarios;
