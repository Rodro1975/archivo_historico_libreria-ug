"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

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
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AutorSchema),
    defaultValues: { vigencia: true },
  });

  const [dependencias, setDependencias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Cargar dependencias
  useEffect(() => {
    supabase
      .from("dependencias")
      .select("id,nombre")
      .then(({ data }) => {
        if (data) setDependencias(data);
      });
  }, []);

  // Cargar unidades académicas
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
    // 1) Intentar buscar un usuario con ese email:
    let usuarioId = null;
    const { data: usersData, error: userErr } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", formData.correo_institucional)
      .maybeSingle();
    if (userErr) {
      console.error("Error buscando usuario por email:", userErr);
      toast.error("Error verificando cuenta de usuario.");
      return;
    }
    if (usersData) {
      usuarioId = usersData.id;
      console.log("Autor coincide con usuario UUID:", usuarioId);
    } else {
      console.log(
        "No existe usuario con ese email, se dejará usuario_id en NULL"
      );
    }

    // 2) Insertar el autor, usando usuarioId o null
    try {
      const { error: insertErr } = await supabase.from("autores").insert([
        {
          usuario_id: usuarioId,
          nombre_completo: formData.nombre_completo,
          cargo: formData.cargo,
          correo_institucional: formData.correo_institucional,
          dependencia_id: formData.dependencia_id,
          unidad_academica_id: formData.unidad_academica_id,
          vigencia: formData.vigencia,
          fecha_creacion: new Date(),
          fecha_modificacion: new Date(),
        },
      ]);
      if (insertErr) throw insertErr;
      console.log("Autor insertado con éxito.");

      // 3) Si existe usuarioId, actualizar es_autor = true
      if (usuarioId) {
        const { error: updateErr } = await supabase
          .from("usuarios")
          .update({ es_autor: true })
          .eq("id", usuarioId);
        if (updateErr) {
          console.error("Error actualizando es_autor en usuarios:", updateErr);
          toast.error(
            "Autor registrado, pero no se pudo actualizar el estado en usuarios."
          );
        } else {
          console.log("Campo es_autor actualizado en usuarios:", usuarioId);
        }
      }

      toast.success("Autor registrado exitosamente.");
      reset();
      // 4) recarga la lista de usuarios en el padre
      refreshUsuarios();
    } catch (err) {
      console.error("Error registrando autor:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
      <Toaster position="top-right" />
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el nombre completo"
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
              <select
                {...register("cargo")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona un cargo
                </option>
                <option value="asistente">Asistente</option>
                <option value="director">Director</option>
                <option value="rector">Rector</option>
                <option value="tecnico">Técnico</option>
                <option value="investigador">Investigador</option>
              </select>
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el correo institucional"
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
                  setValueAs: (v) => Number(v),
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                  setValueAs: (v) => (v ? Number(v) : null),
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
              <input
                type="checkbox"
                {...register("vigencia")}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label className="block text-sm font-medium text-gray-700">
                Autor Vigente
              </label>
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
