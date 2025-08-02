"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import { toastError, toastSuccess } from "@/lib/toastUtils";

export default function FormularioVisitaGuiada({ onClose }) {
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

    const detalle = `Solicitud de visita guiada:
Fecha solicitada: ${data.fecha}
Número de personas: ${data.numero_personas}
Motivo: ${data.motivo}
Comentarios adicionales: ${data.comentarios || "Ninguno"}`;

    const { error } = await supabase.from("solicitudes").insert(
      {
        lector_id: user.id,
        nombre: lectorData.nombre,
        tipo: "visita_guiada",
        detalle,
      },
      { returning: "minimal" }
    );

    setLoading(false);
    if (error) {
      toastError(`Error al enviar la solicitud: ${error.message}`);
    } else {
      toastSuccess("Solicitud de visita guiada enviada correctamente");
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
              Solicitud de Visita Guiada
            </h1>
          </div>

          <form
            className="grid grid-cols-1 gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label
                htmlFor="fecha"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Fecha solicitada
              </label>
              <input
                id="fecha"
                type="date"
                {...register("fecha", {
                  required: "La fecha es obligatoria",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
              />
              {errors.fecha && (
                <p className="text-red-500 text-xs italic">
                  {errors.fecha.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="numero_personas"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Número de personas
              </label>
              <input
                id="numero_personas"
                type="number"
                min="1"
                {...register("numero_personas", {
                  required: "Indica el número de personas",
                  min: { value: 1, message: "Debe ser al menos 1 persona" },
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading}
              />
              {errors.numero_personas && (
                <p className="text-red-500 text-xs italic">
                  {errors.numero_personas.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="motivo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Motivo de la visita
              </label>
              <textarea
                id="motivo"
                rows={4}
                {...register("motivo", {
                  required: "Por favor, indica el motivo de la visita",
                  minLength: {
                    value: 10,
                    message: "El motivo debe tener al menos 10 caracteres",
                  },
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Describe brevemente el motivo de la visita"
              />
              {errors.motivo && (
                <p className="text-red-500 text-xs italic">
                  {errors.motivo.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="comentarios"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Comentarios adicionales (opcional)
              </label>
              <textarea
                id="comentarios"
                rows={3}
                {...register("comentarios")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Cualquier información adicional"
              />
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
