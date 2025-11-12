"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";

export default function FormularioDonacion({ onClose }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toastError("Debes iniciar sesión para realizar esta acción");
      setLoading(false);
      return;
    }

    const { data: lectorData, error: lectorError } = await supabase
      .from("lectores")
      .select("nombre")
      .eq("id", user.id)
      .single();

    if (lectorError || !lectorData) {
      toastError("No se pudo obtener el nombre del lector");
      setLoading(false);
      return;
    }
    // Construir el detalle de la donación
    const detalle = `Donación de libro:
Título: ${data.titulo}
Autor: ${data.autor}
Año: ${data.anio || "No especificado"}
Formato: ${data.formato || "No especificado"}
Motivo: ${data.motivo}
Observaciones: ${data.observaciones || "Ninguna"}`;

    const { error } = await supabase.from("solicitudes").insert(
      {
        lector_id: user.id,
        nombre: lectorData.nombre,
        tipo: "donacion",
        detalle,
      },
      { returning: "minimal" }
    );

    setLoading(false);
    if (error) {
      toastError(`Error al enviar la donación: ${error.message}`);
    } else {
      toastSuccess("Donación enviada correctamente");
      reset();
      onClose();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mx-10">
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-4xl rounded-lg shadow-lg">
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
              Formulario de Donación de Libro
            </h1>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Título del libro */}
            <div className="mb-4 col-span-full">
              <label
                htmlFor="titulo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Título del libro
              </label>
              <input
                id="titulo"
                type="text"
                {...register("titulo", {
                  required: "El título es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
                placeholder="Ingrese el título del libro"
              />
              {errors.titulo && (
                <p className="text-red-500 text-xs italic">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            {/* Autor */}
            <div className="mb-4 col-span-full">
              <label
                htmlFor="autor"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Autor
              </label>
              <input
                id="autor"
                type="text"
                {...register("autor", {
                  required: "El autor es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
                placeholder="Ingrese el autor principal"
              />
              {errors.autor && (
                <p className="text-red-500 text-xs italic">
                  {errors.autor.message}
                </p>
              )}
            </div>

            {/* Año de publicación */}
            <div className="mb-4 col-span-full md:col-span-1">
              <label
                htmlFor="anio"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Año de publicación
              </label>
              <input
                id="anio"
                type="text"
                {...register("anio")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
                placeholder="Opcional"
              />
            </div>

            {/* Formato */}
            <div className="mb-4 col-span-full md:col-span-1">
              <label
                htmlFor="formato"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Formato
              </label>
              <select
                id="formato"
                {...register("formato")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
              >
                <option value="">Seleccione formato</option>
                <option value="Físico">Físico</option>
                <option value="Digital">Digital</option>
              </select>
            </div>

            {/* Motivo de la donación */}
            <div className="mb-4 col-span-full">
              <label
                htmlFor="motivo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Motivo de la donación
              </label>
              <textarea
                id="motivo"
                rows={4}
                {...register("motivo", {
                  required: "Por favor, indica el motivo de la donación",
                  minLength: {
                    value: 10,
                    message: "El motivo debe tener al menos 10 caracteres",
                  },
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Describe brevemente el motivo de la donación"
              />
              {errors.motivo && (
                <p className="text-red-500 text-xs italic">
                  {errors.motivo.message}
                </p>
              )}
            </div>

            {/* Observaciones */}
            <div className="mb-4 col-span-full">
              <label
                htmlFor="observaciones"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Observaciones
              </label>
              <textarea
                id="observaciones"
                rows={3}
                {...register("observaciones")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Cualquier otro dato relevante (opcional)"
              />
            </div>

            <div className="col-span-full text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue hover:bg-gold text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Donación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
