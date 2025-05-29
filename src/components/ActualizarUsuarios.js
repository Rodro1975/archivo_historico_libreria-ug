"use client";

import { useEffect } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

const ActualizarUsuarios = ({ usuario, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: usuario,
  });

  useEffect(() => {
    reset(usuario);
  }, [usuario, reset]);

  const handleSubmitForm = async (data) => {
    const { error } = await supabase
      .from("usuarios")
      .update(data)
      .eq("id", usuario.id);

    if (error) {
      toast.error("Error al actualizar el usuario.");
    } else {
      toast.success("Usuario actualizado correctamente.");
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Toaster position="top-right" />
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
              Modificar Usuario
            </h1>
          </div>
          <form
            onSubmit={handleSubmit(handleSubmitForm)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primer Nombre
              </label>
              <input
                type="text"
                {...register("primer_nombre")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Segundo Nombre
              </label>
              <input
                type="text"
                {...register("segundo_nombre")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellido Paterno
              </label>
              <input
                type="text"
                {...register("apellido_paterno")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Apellido Materno
              </label>
              <input
                type="text"
                {...register("apellido_materno")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                {...register("telefono")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <input
                type="text"
                {...register("role")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Foto
              </label>
              <input
                type="text"
                {...register("foto")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
            </div>

            <div className="col-span-2 flex justify-end space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-700"
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

export default ActualizarUsuarios;
