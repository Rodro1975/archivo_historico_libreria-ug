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
                pattern="^[\p{L}]+(?:\s+[\p{L}]+)*$"
                title="Solo letras y espacios. Sin números ni símbolos."
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el nombre completo"
              />
              {errors.nombre_completo && (
                <span className="text-red-500 text-sm">
                  {errors.nombre_completo.message}
                </span>
              )}
            </div>

            {/* Institución (UG / Externa) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Institución
              </label>
              <select
                {...register("institucion_tipo")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona institución
                </option>
                <option value="UG">UG</option>
                <option value="Externa">Externa</option>
              </select>
              {errors.institucion_tipo && (
                <span className="text-red-500 text-sm">
                  {errors.institucion_tipo.message}
                </span>
              )}
            </div>

            {/* Nombre de institución (solo si Externa) */}
            {tipoInstitucion === "Externa" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la institución (Externa)
                </label>
                <input
                  {...register("institucion_nombre")}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  placeholder="Ej. Universidad Nacional"
                />
                {errors.institucion_nombre && (
                  <span className="text-red-500 text-sm">
                    {errors.institucion_nombre.message}
                  </span>
                )}
              </div>
            )}

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                type="email"
                {...register("correo_institucional")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder={
                  tipoInstitucion === "UG"
                    ? "usuario@ugto.mx"
                    : "usuario@dominio.com"
                }
                pattern={
                  tipoInstitucion === "UG"
                    ? "[A-Za-z0-9._%+-]+@ugto\\.mx"
                    : "[^\\s@]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,63}"
                }
                title={
                  tipoInstitucion === "UG"
                    ? "Debe ser un correo institucional @ugto.mx"
                    : "Correo válido con TLD de letras (p. ej., .com, .mx, .org, .net, etc.)"
                }
              />
              {errors.correo_institucional && (
                <span className="text-red-500 text-sm">
                  {errors.correo_institucional.message}
                </span>
              )}
              {tipoInstitucion === "UG" ? (
                <p className="text-xs text-gray-500 mt-1">
                  Debe ser un correo institucional <strong>@ugto.mx</strong>.
                </p>
              ) : tipoInstitucion === "Externa" ? (
                <p className="text-xs text-gray-500 mt-1">
                  Se acepta cualquier dominio de correo válido (TLD de letras).
                </p>
              ) : null}
            </div>

            {/* Dependencia (solo si UG) */}
            {tipoInstitucion === "UG" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rectoría / Campus / CNMS / Secretaría
                </label>
                <select
                  {...register("dependencia_id", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
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
            )}

            {/* Unidad Académica (opcional, solo si UG) */}
            {tipoInstitucion === "UG" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  División / Escuela
                </label>
                <select
                  {...register("unidad_academica_id", {
                    setValueAs: (v) => (v ? Number(v) : undefined),
                  })}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
            )}

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
