"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";

const ActualizarAutores = ({ autor, onClose, onUpdate }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre_completo: autor.nombre_completo,
      cargo: autor.cargo,
      correo_institucional: autor.correo_institucional,
      vigencia: autor.vigencia,
      dependencia_id: autor.dependencia_id,
      unidad_academica_id: autor.unidad_academica_id,
    },
  });

  const [dependencias, setDependencias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [error, setError] = useState(null);

  const dependenciaId = watch("dependencia_id");

  // Cargar dependencias
  useEffect(() => {
    supabase
      .from("dependencias")
      .select("id,nombre")
      .then(({ data }) => {
        if (data) setDependencias(data);
      });
  }, []);

  // Cargar **todas** las unidades académicas (sin filtrar)
  useEffect(() => {
    supabase
      .from("unidades_academicas")
      .select("id,nombre")
      .then(({ data }) => {
        if (data) setUnidades(data);
      });
  }, []);

  // Resetear cuando cambie el autor
  useEffect(() => {
    reset({
      nombre_completo: autor.nombre_completo,
      cargo: autor.cargo,
      correo_institucional: autor.correo_institucional,
      vigencia: autor.vigencia,
      dependencia_id: autor.dependencia_id,
      unidad_academica_id: autor.unidad_academica_id,
    });
  }, [autor, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        nombre_completo: data.nombre_completo,
        cargo: data.cargo,
        correo_institucional: data.correo_institucional,
        vigencia: data.vigencia,
        dependencia_id: data.dependencia_id,
        unidad_academica_id: data.unidad_academica_id,
      };

      const { error: updateError } = await supabase
        .from("autores")
        .update(payload)
        .eq("id", autor.id);

      if (updateError) {
        toastError("Error al actualizar autor.");
        return;
      }

      toastSuccess("Autor actualizado correctamente.");

      // Espera 1 segundo para que el toast se muestre antes de cerrar
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (err) {
      toastError("Ocurrió un error inesperado.");
      console.error(err);
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

            <h1 className="font-black text-3xl mt-4 text-blue">
              Modificar Autor
            </h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-4 rounded">
              Error: {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue"
          >
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                {...register("nombre_completo")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <input
                {...register("cargo")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Dependencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dependencia
              </label>
              <select
                {...register("dependencia_id")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar dependencia</option>
                {dependencias.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Unidad Académica (ahora con todas cargadas) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unidad Académica
              </label>
              <select
                {...register("unidad_academica_id")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Seleccionar unidad</option>
                {unidades.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Correo Institucional */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo Institucional
              </label>
              <input
                type="email"
                {...register("correo_institucional")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Vigencia */}
            <div className="flex items-center space-x-2">
              <label className="block text-sm font-medium text-gray-700">
                Vigente
              </label>
              <input
                type="checkbox"
                {...register("vigencia")}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>

            {/* Botones */}
            <div className="col-span-2 flex justify-end space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Guardar Cambios
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
};

export default ActualizarAutores;
