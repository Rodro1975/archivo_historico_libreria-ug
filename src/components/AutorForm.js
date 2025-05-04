"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import supabase from "@/lib/supabase";
import Image from "next/image";

// Esquema de validación
const AutorSchema = z.object({
  nombre_completo: z.string().min(5, "Mínimo 5 caracteres"),
  cargo: z.string().min(3, "Mínimo 3 caracteres"),
  correo_institucional: z
    .string()
    .email("Email inválido")
    .refine((email) => email.endsWith("@ugto.mx"), {
      message: "Debe ser un correo institucional @ugto.mx",
    }),
  dependencia_id: z.number().int("Debe seleccionar una dependencia"),
  unidad_academica_id: z.number().int().optional(),
  vigencia: z.boolean().default(true),
});

export default function AutorForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AutorSchema),
    defaultValues: {
      vigencia: true,
    },
  });

  const dependenciaId = watch("dependencia_id");

  const [dependencias, setDependencias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // 1) Cargar dependencias
  useEffect(() => {
    supabase
      .from("dependencias")
      .select("id,nombre")
      .then(({ data }) => {
        if (data) setDependencias(data);
      });
  }, []);

  // 2) Cargar TODAS las unidades académicas **sin filtrar**
  useEffect(() => {
    setLoadingUnidades(true);
    supabase
      .from("unidades_academicas")
      .select("id,nombre")
      .then(({ data }) => {
        if (data) setUnidades(data);
        setLoadingUnidades(false);
      });
  }, []);

  const onSubmit = async (formData) => {
    try {
      const { error } = await supabase.from("autores").insert([
        {
          ...formData,
          usuario_id: null,
        },
      ]);
      if (error) throw error;
      alert("Autor registrado exitosamente!");
      reset();
    } catch (error) {
      console.error("Error registrando autor:", error.message);
      alert(`Error: ${error.message}`);
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
            <h1 className="font-black text-3xl mb-5 text-gold">
              Registro de Autores
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                {...register("nombre_completo")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
              {errors.nombre_completo && (
                <span className="text-red-500 text-sm">
                  {errors.nombre_completo.message}
                </span>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cargo
              </label>
              <input
                {...register("cargo")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
              {errors.cargo && (
                <span className="text-red-500 text-sm">
                  {errors.cargo.message}
                </span>
              )}
            </div>

            {/* Correo Institucional */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo Institucional
              </label>
              <input
                {...register("correo_institucional")}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              />
              {errors.correo_institucional && (
                <span className="text-red-500 text-sm">
                  {errors.correo_institucional.message}
                </span>
              )}
            </div>

            {/* Dependencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dependencia
              </label>
              <select
                {...register("dependencia_id", {
                  setValueAs: (value) => Number(value),
                })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
                onChange={(e) => {
                  setValue("dependencia_id", Number(e.target.value));
                  // note: ahora no vaciamos unidad porque todas están disponibles
                }}
              >
                <option value="">Seleccionar dependencia</option>
                {dependencias.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nombre}
                  </option>
                ))}
              </select>
              {errors.dependencia_id && (
                <span className="text-red-500 text-sm">
                  {errors.dependencia_id.message}
                </span>
              )}
            </div>

            {/* Unidad Académica */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unidad Académica
              </label>
              <select
                {...register("unidad_academica_id", {
                  setValueAs: (value) => (value ? Number(value) : null),
                })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-blue"
              >
                <option value="">
                  {loadingUnidades ? "Cargando..." : "Seleccionar unidad"}
                </option>
                {unidades.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Vigencia */}
            <div className="flex items-center space-x-2 col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                Autor Vigente
              </label>
              <input
                type="checkbox"
                {...register("vigencia")}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>

            {/* Botón de Registro */}
            <div className="col-span-full">
              <button
                type="submit"
                className="transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                Registrar Autor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
