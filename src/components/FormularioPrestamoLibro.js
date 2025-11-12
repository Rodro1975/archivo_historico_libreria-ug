"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import { toastError, toastSuccess } from "@/lib/toastUtils";

export default function FormularioPrestamoLibro({ onClose }) {
  const [libros, setLibros] = useState([]);
  const [cargandoLibros, setCargandoLibros] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  // Cargar la lista de libros disponibles al montar el componente
  useEffect(() => {
    const fetchLibros = async () => {
      setCargandoLibros(true);
      const { data, error } = await supabase
        .from("libros")
        .select("id_libro, titulo")
        .order("titulo", { ascending: true });

      if (error) {
        toastError("Error al cargar los libros");
        console.error(error);
      } else {
        setLibros(data);
      }
      setCargandoLibros(false);
    };

    fetchLibros();
  }, []);

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
    // Obtener el nombre del lector desde la tabla "lectores"
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
    // Crear el detalle de la solicitud
    const detalle = `Libro solicitado: ${data.libro_id}. Motivo: ${data.motivo}`;

    const { error } = await supabase.from("solicitudes").insert(
      {
        lector_id: user.id,
        nombre: lectorData.nombre,
        tipo: "prestamo",
        detalle,
      },
      { returning: "minimal" }
    );
    // Manejar la respuesta de la inserción
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
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
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
              Solicitud de Préstamo de Libro
            </h1>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="mb-4 col-span-full">
              <label
                htmlFor="libro_id"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Selecciona un libro
              </label>
              <select
                id="libro_id"
                {...register("libro_id", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                disabled={loading || cargandoLibros}
              >
                <option value="">-- Elige un libro --</option>
                {libros.map((libro) => (
                  <option key={libro.id_libro} value={libro.titulo}>
                    {libro.titulo}
                  </option>
                ))}
              </select>
              {errors.libro_id && (
                <p className="text-red-500 text-xs italic">
                  {errors.libro_id.message}
                </p>
              )}
            </div>

            <div className="mb-4 col-span-full">
              <label
                htmlFor="motivo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Motivo de la solicitud
              </label>
              <textarea
                id="motivo"
                rows={4}
                {...register("motivo", {
                  required: "Por favor, indica el motivo de la solicitud",
                  minLength: {
                    value: 10,
                    message: "El motivo debe tener al menos 10 caracteres",
                  },
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full resize-none"
                disabled={loading}
                placeholder="Describe brevemente el motivo de tu solicitud"
              />
              {errors.motivo && (
                <p className="text-red-500 text-xs italic">
                  {errors.motivo.message}
                </p>
              )}
            </div>

            <div className="col-span-full text-center mt-4">
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
