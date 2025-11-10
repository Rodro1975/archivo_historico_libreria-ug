"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { validateEmailByInstitution } from "@/lib/emailValidators";

// helper: convierte selects a número o undefined
const toInt = (v) =>
  v === "" || v === null || typeof v === "undefined" ? undefined : Number(v);

// normaliza nombre: trim + colapsa espacios
const normalizeName = (s = "") => s.trim().replace(/\s+/g, " ");

// Zod
const AutorSchema = z
  .object({
    nombre_completo: z
      .string()
      .trim()
      .min(5, "Mínimo 5 caracteres")
      .regex(
        /^[\p{L}]+(?:\s+[\p{L}]+)*$/u,
        "Solo letras y espacios. Sin números ni símbolos."
      )
      .transform((v) => normalizeName(v)),
    correo_institucional: z.string().min(1, "Email inválido"),
    institucion_tipo: z.enum(["UG", "Externa"], {
      required_error: "Selecciona la institución",
      invalid_type_error: "Selecciona la institución",
    }),
    institucion_nombre: z.string().optional(), // requerido si Externa
    dependencia_id: z.preprocess(toInt, z.number().int().positive().optional()),
    unidad_academica_id: z.preprocess(
      toInt,
      z.number().int().positive().optional()
    ),
  })
  .superRefine((val, ctx) => {
    const correo = val.correo_institucional?.toLowerCase?.().trim() || "";

    // Validación unificada por tipo
    const emailErr = validateEmailByInstitution(val.institucion_tipo, correo);
    if (emailErr) {
      ctx.addIssue({
        path: ["correo_institucional"],
        code: z.ZodIssueCode.custom,
        message: emailErr,
      });
    }

    // Extra: No permitir "Externa" con correo @ugto.mx
    if (val.institucion_tipo === "Externa" && correo.endsWith("@ugto.mx")) {
      ctx.addIssue({
        path: ["institucion_tipo"],
        code: z.ZodIssueCode.custom,
        message: 'Un correo @ugto.mx corresponde a "UG".',
      });
    }

    // UG: dependencia obligatoria y NO capturar institucion_nombre
    if (val.institucion_tipo === "UG") {
      if (!val.dependencia_id) {
        ctx.addIssue({
          path: ["dependencia_id"],
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar una dependencia",
        });
      }
      if (val.institucion_nombre && val.institucion_nombre.trim() !== "") {
        ctx.addIssue({
          path: ["institucion_nombre"],
          code: z.ZodIssueCode.custom,
          message: "No debe capturarse nombre cuando la institución es UG",
        });
      }
    }

    // Externa: nombre obligatorio; no aplicar dep/unidad
    if (val.institucion_tipo === "Externa") {
      if (!val.institucion_nombre || val.institucion_nombre.trim() === "") {
        ctx.addIssue({
          path: ["institucion_nombre"],
          code: z.ZodIssueCode.custom,
          message: "Indica el nombre de la institución externa",
        });
      }
      if (typeof val.dependencia_id !== "undefined") {
        ctx.addIssue({
          path: ["dependencia_id"],
          code: z.ZodIssueCode.custom,
          message: "No aplica dependencia para institución externa",
        });
      }
      if (typeof val.unidad_academica_id !== "undefined") {
        ctx.addIssue({
          path: ["unidad_academica_id"],
          code: z.ZodIssueCode.custom,
          message: "No aplica unidad académica para institución externa",
        });
      }
    }
  });

export default function AutorForm({ onRefreshUsuarios }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(AutorSchema),
    defaultValues: {
      nombre_completo: "",
      correo_institucional: "",
      institucion_tipo: undefined,
      institucion_nombre: "",
      dependencia_id: undefined,
      unidad_academica_id: undefined,
    },
    shouldUnregister: true,
  });

  const tipoInstitucion = watch("institucion_tipo");
  const dependenciaSeleccionada = watch("dependencia_id");
  const correoWatch = watch("correo_institucional");

  const [dependencias, setDependencias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // Autoseleccionar UG si el correo es @ugto.mx
  useEffect(() => {
    const correo = (correoWatch || "").trim().toLowerCase();
    if (correo.endsWith("@ugto.mx") && tipoInstitucion !== "UG") {
      setValue("institucion_tipo", "UG", { shouldValidate: true });
    }
  }, [correoWatch, tipoInstitucion, setValue]);

  // Cargar dependencias activas
  useEffect(() => {
    supabase
      .from("dependencias")
      .select("id,nombre,tipo,activo")
      .eq("activo", true)
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setDependencias(data || []);
      });
  }, []);

  // Cargar unidades activas por dependencia (si UG)
  useEffect(() => {
    if (tipoInstitucion !== "UG" || !dependenciaSeleccionada) {
      setUnidades([]);
      setLoadingUnidades(false);
      setValue("unidad_academica_id", undefined, { shouldValidate: true });
      return;
    }
    setLoadingUnidades(true);
    supabase
      .from("unidades_academicas")
      .select("id,nombre,tipo,activo,dependencia_id")
      .eq("activo", true)
      .eq("dependencia_id", dependenciaSeleccionada)
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true })
      .then(({ data, error }) => {
        setUnidades(error ? [] : data || []);
        setLoadingUnidades(false);
      });
  }, [tipoInstitucion, dependenciaSeleccionada, setValue]);

  // Si pasan a Externa, limpiar dep/unidad
  useEffect(() => {
    if (tipoInstitucion === "Externa") {
      setValue("dependencia_id", undefined, { shouldValidate: true });
      setValue("unidad_academica_id", undefined, { shouldValidate: true });
    }
  }, [tipoInstitucion, setValue]);

  const onSubmit = async (formData) => {
    try {
      const nombreNorm = normalizeName(formData.nombre_completo).toLowerCase();
      const correoNorm = formData.correo_institucional.trim().toLowerCase();

      // 0) Reglas rápidas por correo/Institución (por si el usuario forzó algo raro)
      if (
        correoNorm.endsWith("@ugto.mx") &&
        formData.institucion_tipo !== "UG"
      ) {
        toastError(
          'Un correo @ugto.mx corresponde a "UG". Cambia la institución.'
        );
        return;
      }

      // 1) Checar duplicados por correo (case-insensitive)
      {
        const { data: dupMail, error: errMail } = await supabase
          .from("autores")
          .select("id")
          .ilike("correo_institucional", correoNorm)
          .limit(1);

        if (errMail) throw errMail;
        if (dupMail && dupMail.length > 0) {
          toastError("Ese correo ya está registrado como autor.");
          return;
        }
      }

      // 2) Checar duplicados por nombre completo (normalizado, case-insensitive)
      {
        const { data: dupName, error: errName } = await supabase
          .from("autores")
          .select("id, nombre_completo")
          .ilike("nombre_completo", nombreNorm)
          .limit(1);

        if (errName) throw errName;
        if (dupName && dupName.length > 0) {
          toastError("Ese nombre de autor ya está registrado.");
          return;
        }
      }

      // 3) Vincular con usuarios (si existe por correo)
      let usuarioId = null;
      if (correoNorm) {
        const { data: usersData, error: userErr } = await supabase
          .from("usuarios")
          .select("id")
          .ilike("email", correoNorm)
          .maybeSingle();
        if (userErr) throw userErr;
        if (usersData) usuarioId = usersData.id;
      }

      // 4) Payload por institución
      const payload = {
        usuario_id: usuarioId ?? null,
        nombre_completo: normalizeName(formData.nombre_completo),
        correo_institucional: correoNorm,
        institucion_tipo: formData.institucion_tipo,
        institucion_nombre:
          formData.institucion_tipo === "Externa"
            ? (formData.institucion_nombre || "").trim()
            : null,
        dependencia_id:
          formData.institucion_tipo === "UG" ? formData.dependencia_id : null,
        unidad_academica_id:
          formData.institucion_tipo === "UG"
            ? formData.unidad_academica_id ?? null
            : null,
        fecha_creacion: new Date(),
        fecha_modificacion: new Date(),
      };

      // 5) Insert autor
      const { error: insertErr } = await supabase
        .from("autores")
        .insert([payload]);
      if (insertErr) throw insertErr;

      // 6) Marcar usuario como es_autor (si existe)
      if (usuarioId) {
        const { error: updateErr } = await supabase
          .from("usuarios")
          .update({ es_autor: true })
          .eq("id", usuarioId);
        if (updateErr) {
          // No interrumpimos; avisamos suave
          console.error("Error actualizando es_autor:", updateErr);
          toastError(
            "Autor registrado, pero no se pudo actualizar el estado en usuarios."
          );
        }
      }

      toastSuccess("Autor registrado exitosamente.");
      reset();
      onRefreshUsuarios?.();
    } catch (err) {
      console.error("Error registrando autor:", err);
      toastError(`Error: ${err.message || "operación fallida"}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-blue">
      <div className="bg-white flex flex-col w-full max-w-2xl rounded-xl shadow-xl p-6 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/images/escudo-png.png"
            alt="Escudo"
            width={80}
            height={80}
            className="escudo"
            priority
          />
          <h1 className="font-black text-2xl sm:text-3xl text-blue mb-2">
            Registro de Autores
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            Completa todos los campos obligatorios{" "}
            <span className="text-yellow-500">*</span>
          </p>
        </div>
        {/* Errores globales */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-3 rounded bg-yellow border-l-4 border-gold text-blue animate-fadeIn">
            Corrige los campos marcados en amarillo.
          </div>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
        >
          {/* Nombre Completo */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Nombre Completo <span className="text-yellow-500">*</span>
            </label>
            <input
              {...register("nombre_completo")}
              pattern="^[\p{L}]+(?:\s+[\p{L}]+)*$"
              title="Solo letras y espacios. Sin números ni símbolos."
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue placeholder:text-gray"
              placeholder="Ingresa el nombre completo"
            />
            {errors.nombre_completo && (
              <span className="text-yellow-500 text-xs">
                {errors.nombre_completo.message}
              </span>
            )}
          </div>
          {/* Institución */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Institución <span className="text-yellow-500">*</span>
            </label>
            <select
              {...register("institucion_tipo")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona institución
              </option>
              <option value="UG">UG</option>
              <option value="Externa">Externa</option>
            </select>
            {errors.institucion_tipo && (
              <span className="text-yellow-500 text-xs">
                {errors.institucion_tipo.message}
              </span>
            )}
          </div>
          {tipoInstitucion === "Externa" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue">
                Nombre de la institución{" "}
                <span className="text-yellow-500">*</span>
              </label>
              <input
                {...register("institucion_nombre")}
                className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue placeholder:text-gray"
                placeholder="Ej. Universidad Nacional"
              />
              {errors.institucion_nombre && (
                <span className="text-yellow-500 text-xs">
                  {errors.institucion_nombre.message}
                </span>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-blue">
              Correo <span className="text-yellow-500">*</span>
            </label>
            <input
              type="email"
              {...register("correo_institucional")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue placeholder:text-gray"
              placeholder={
                tipoInstitucion === "UG"
                  ? "usuario@ugto.mx"
                  : "usuario@dominio.com"
              }
            />
            {errors.correo_institucional && (
              <span className="text-yellow-500 text-xs">
                {errors.correo_institucional.message}
              </span>
            )}
          </div>
          {tipoInstitucion === "UG" && (
            <>
              <div>
                <label className="block text-sm font-medium text-blue">
                  Dependencia <span className="text-yellow-500">*</span>
                </label>
                <select
                  {...register("dependencia_id")}
                  className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
                >
                  <option value="">Seleccionar dependencia</option>
                  {dependencias.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nombre}
                    </option>
                  ))}
                </select>
                {errors.dependencia_id && (
                  <span className="text-yellow-500 text-xs">
                    {errors.dependencia_id.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-blue">
                  División / Escuela
                </label>
                <select
                  {...register("unidad_academica_id")}
                  className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
                  disabled={!dependenciaSeleccionada || loadingUnidades}
                >
                  <option value="">
                    {loadingUnidades
                      ? "Cargando..."
                      : dependenciaSeleccionada
                      ? "Seleccionar unidad"
                      : "Selecciona una dependencia primero"}
                  </option>
                  {unidades.map((uni) => (
                    <option key={uni.id} value={uni.id}>
                      {uni.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              className="transition duration-200 bg-yellow text-blue hover:bg-gold hover:text-white w-full py-3 rounded-lg text-md shadow-sm hover:shadow-md font-semibold animate-fadeIn"
            >
              Registrar Autor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
