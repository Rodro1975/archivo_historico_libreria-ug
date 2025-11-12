"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { validateEmailByInstitution } from "@/lib/emailValidators";

// regex mejorado para nombres con Unicode
const NAME_REGEX = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;

// helper para detectar si el correo es UG
const esUGCorreo = (correo = "") =>
  (correo || "").toLowerCase().trim().endsWith("@ugto.mx");

const ActualizarAutores = ({ autor, onClose, onUpdate }) => {
  const tipoInicial = useMemo(() => {
    if (
      autor?.institucion_tipo === "UG" ||
      autor?.institucion_tipo === "Externa"
    ) {
      return autor.institucion_tipo;
    }
    return esUGCorreo(autor?.correo_institucional) ? "UG" : "Externa";
  }, [autor]);
  // Configuración de react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre_completo: autor?.nombre_completo ?? "",
      correo_institucional: autor?.correo_institucional ?? "",
      dependencia_id: autor?.dependencia_id ?? undefined,
      unidad_academica_id: autor?.unidad_academica_id ?? undefined,
      institucion_tipo: tipoInicial,
      institucion_nombre: autor?.institucion_nombre ?? "",
    },
    shouldUnregister: true,
  });

  const tipoInstitucion = watch("institucion_tipo");
  const dependenciaSeleccionada = watch("dependencia_id");

  const [dependencias, setDependencias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [error, setError] = useState(null);
  // Cargar dependencias al montar el componente
  useEffect(() => {
    supabase
      .from("dependencias")
      .select("id,nombre,tipo,activo")
      .eq("activo", true)
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true })
      .then(({ data, error }) => {
        if (error) return setError(error.message);
        setDependencias(data || []);
      });
  }, []);
  // Cargar unidades académicas cuando cambie la dependencia seleccionada
  useEffect(() => {
    if (tipoInstitucion !== "UG" || !dependenciaSeleccionada) {
      setUnidades([]);
      setLoadingUnidades(false);
      setValue("unidad_academica_id", undefined, { shouldValidate: true });
      return;
    }
    // Cargar unidades académicas para la dependencia seleccionada
    setLoadingUnidades(true);
    supabase
      .from("unidades_academicas")
      .select("id,nombre,tipo,activo,dependencia_id")
      .eq("activo", true)
      .eq("dependencia_id", dependenciaSeleccionada)
      .order("tipo", { ascending: true })
      .order("nombre", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setUnidades([]);
        } else {
          setUnidades(data || []);
        }
        setLoadingUnidades(false);
      });
  }, [tipoInstitucion, dependenciaSeleccionada, setValue]);
  // Resetear el formulario cuando cambie el autor
  useEffect(() => {
    const deducido =
      autor?.institucion_tipo ??
      (esUGCorreo(autor?.correo_institucional) ? "UG" : "Externa");

    reset({
      nombre_completo: autor?.nombre_completo ?? "",
      correo_institucional: autor?.correo_institucional ?? "",
      dependencia_id: autor?.dependencia_id ?? undefined,
      unidad_academica_id: autor?.unidad_academica_id ?? undefined,
      institucion_tipo: deducido,
      institucion_nombre: autor?.institucion_nombre ?? "",
    });
  }, [autor, reset]);
  // Limpiar campos específicos al cambiar el tipo de institución
  useEffect(() => {
    if (tipoInstitucion === "Externa") {
      setValue("dependencia_id", undefined, { shouldValidate: true });
      setValue("unidad_academica_id", undefined, { shouldValidate: true });
    }
  }, [tipoInstitucion, setValue]);

  const onSubmit = async (data) => {
    try {
      const correoTrim = (data.correo_institucional || "").trim().toLowerCase();

      // una sola validación unificada con el helper
      const emailErr = validateEmailByInstitution(
        data.institucion_tipo,
        correoTrim
      );
      if (emailErr) return toastError(emailErr);

      // Reglas adicionales de negocio (no de email)
      if (data.institucion_tipo === "UG" && !data.dependencia_id) {
        return toastError("Debes seleccionar una dependencia.");
      }
      if (
        data.institucion_tipo === "Externa" &&
        !(data.institucion_nombre || "").trim()
      ) {
        return toastError("Indica el nombre de la institución externa.");
      }

      // Normalizar nombre (igual que antes)
      const nombreNorm = (data.nombre_completo || "")
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .trim();

      const payload = {
        nombre_completo: nombreNorm,
        correo_institucional: correoTrim,
        institucion_tipo: data.institucion_tipo,
        institucion_nombre:
          data.institucion_tipo === "Externa"
            ? (data.institucion_nombre || "").trim()
            : null,
        dependencia_id:
          data.institucion_tipo === "UG" ? Number(data.dependencia_id) : null,
        unidad_academica_id:
          data.institucion_tipo === "UG"
            ? data.unidad_academica_id
              ? Number(data.unidad_academica_id)
              : null
            : null,
        fecha_modificacion: new Date(),
      };

      const { error: updateError } = await supabase
        .from("autores")
        .update(payload)
        .eq("id", autor.id);

      if (updateError) {
        return toastError(`Error al actualizar autor: ${updateError.message}`);
      }

      toastSuccess("Autor actualizado correctamente.");
      setTimeout(() => {
        onUpdate?.();
        onClose?.();
      }, 600);
    } catch (err) {
      console.error(err);
      toastError("Ocurrió un error inesperado.");
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
                {...register("nombre_completo", {
                  required: "Requerido",
                  minLength: { value: 5, message: "Mínimo 5 caracteres" },
                  validate: (v) => {
                    const val = (v || "").normalize("NFKC").trim();
                    if (!NAME_REGEX.test(val)) {
                      return "Solo letras y espacios. Sin números ni símbolos.";
                    }
                    return true;
                  },
                })}
                pattern="^[\p{L}]+(?:\s+[\p{L}]+)*$"
                title="Solo letras y espacios. Sin números ni símbolos."
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
                {...register("institucion_tipo", { required: "Requerido" })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                defaultValue={tipoInicial}
              >
                <option value="">Selecciona institución</option>
                <option value="UG">UG</option>
                <option value="Externa">Externa</option>
              </select>
              {errors.institucion_tipo && (
                <span className="text-red-500 text-sm">
                  {errors.institucion_tipo.message}
                </span>
              )}
            </div>

            {/* Nombre de institución (solo Externa) */}
            {tipoInstitucion === "Externa" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de la institución (Externa)
                </label>
                <input
                  {...register("institucion_nombre", {
                    validate: (v) => {
                      if (tipoInstitucion !== "Externa") return true;
                      return (v || "").trim() !== ""
                        ? true
                        : "Indica el nombre de la institución externa";
                    },
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ej. Universidad Nacional"
                />
                {errors.institucion_nombre && (
                  <span className="text-red-500 text-sm">
                    {errors.institucion_nombre.message}
                  </span>
                )}
              </div>
            )}

            {/* Dependencia (solo UG) */}
            {tipoInstitucion === "UG" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rectoría / Campus / CNMS / Secretaría
                </label>
                <select
                  {...register("dependencia_id", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    validate: (v) =>
                      tipoInstitucion !== "UG" ||
                      !!v ||
                      "Debes seleccionar una dependencia",
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  defaultValue={autor?.dependencia_id ?? ""}
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

            {/* Unidad Académica (opcional, solo UG) */}
            {tipoInstitucion === "UG" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  División / Escuela
                </label>
                <select
                  {...register("unidad_academica_id", {
                    setValueAs: (v) => (v ? Number(v) : undefined),
                  })}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  defaultValue={autor?.unidad_academica_id ?? ""}
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

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Correo
              </label>
              <input
                type="email"
                {...register("correo_institucional", {
                  required: "Requerido",
                  // CHANGED: misma lógica que submit pero a nivel de campo
                  validate: (v) => {
                    const msg = validateEmailByInstitution(
                      tipoInstitucion,
                      v || ""
                    );
                    return msg || true;
                  },
                })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder={
                  tipoInstitucion === "UG"
                    ? "usuario@ugto.mx"
                    : "usuario@dominio.com"
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
                  Se acepta cualquier dominio de correo válido permitido.
                </p>
              ) : null}
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
