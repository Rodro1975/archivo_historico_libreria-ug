"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";

export default function FormularioBd({ onClose }) {
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

    const detalle = `Solicitud de listado de: ${data.tipo_listado}.
Justificación: ${data.justificacion}`;

    const { error } = await supabase.from("solicitudes").insert(
      {
        lector_id: user.id,
        nombre: lectorData.nombre,
        tipo: "listado",
        detalle,
      },
      { returning: "minimal" }
    );

    setLoading(false);
    if (error) {
      toastError(`Error al enviar la solicitud: ${error.message}`);
    } else {
      toastSuccess("Solicitud enviada correctamente");
      reset();
      onClose();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mx-10">
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-3xl rounded-lg shadow-lg">
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
              Solicitud de Listado de Autores o Títulos
            </h1>
          </div>

          <form
            className="grid grid-cols-1 gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-4">
              <label
                htmlFor="tipo_listado"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tipo de listado solicitado
              </label>
              <select
                id="tipo_listado"
                {...register("tipo_listado", {
                  required: "Selecciona el tipo de listado",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="Autores">Autores</option>
                <option value="Títulos">Títulos</option>
              </select>
              {errors.tipo_listado && (
                <p className="text-red-500 text-xs italic">
                  {errors.tipo_listado.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="justificacion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Justificación de la solicitud
              </label>
              <textarea
                id="justificacion"
                rows={4}
                {...register("justificacion", {
                  required: "Por favor, indica la justificación",
                  minLength: {
                    value: 10,
                    message:
                      "La justificación debe tener al menos 10 caracteres",
                  },
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Explica brevemente por qué necesitas este listado"
              />
              {errors.justificacion && (
                <p className="text-red-500 text-xs italic">
                  {errors.justificacion.message}
                </p>
              )}
            </div>

            <div className="text-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue hover:bg-gold text-white font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
