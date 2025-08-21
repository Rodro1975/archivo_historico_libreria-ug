// src/components/FormReader.js
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";

export default function FormReader({ open, onClose }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { nombre: "", email: "", password: "", password2: "" },
  });

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = async ({ nombre, email, password }) => {
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboardReader`
          : undefined;

      // 1) Crear usuario con metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: nombre, full_name: nombre },
          emailRedirectTo: redirectTo, // si hay confirmación de correo
        },
      });
      if (signUpError) throw signUpError;

      // 2) Revisar sesión
      let {
        data: { session },
      } = await supabase.auth.getSession();

      // 3) Si no hay sesión, intentar login (si confirmación no es obligatoria)
      if (!session) {
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (loginError) {
          const msg = (loginError?.message || "").toLowerCase();
          if (msg.includes("confirm")) {
            toastSuccess(
              "Registro creado. Revisa tu correo para confirmar tu cuenta."
            );
            reset();
            onClose?.();
            return;
          }
          throw loginError;
        }
        session = loginData?.session || null;
      }

      // 4) Upsert en 'lectores'
      if (session?.user) {
        const lector = {
          id: session.user.id, // FK -> auth.users.id
          email,
          nombre,
          rol: "Lector",
          ultimo_acceso: new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from("lectores")
          .upsert([lector], { onConflict: "id" });
        if (upsertError) throw upsertError;

        toastSuccess("¡Registro completo! Bienvenido.");
        reset();
        onClose?.();
        router.push("/dashboardReader");
      } else {
        // Confirmación por correo
        toastSuccess(
          "Registro creado. Revisa tu correo para confirmar tu cuenta."
        );
        reset();
        onClose?.();
      }
    } catch (e) {
      console.error("Error en registro lector:", e);
      toastError(e?.message || "No se pudo completar el registro");
    }
  };

  const password = watch("password");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !isSubmitting && onClose?.()}
      />

      {/* Contenedor centrado (sin ocupar todo el alto) */}
      <div
        className="relative z-[101] w-full px-4 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-100 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
          {/* Limitar altura y permitir scroll interno */}
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="p-8 sm:p-10 text-center">
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
              <h1 className="font-black text-3xl mb-2 text-blue">
                Crear cuenta de Lector
              </h1>
              <p className="text-sm text-gray-500">
                Regístrate con tu correo y contraseña para acceder como lector.
              </p>
            </div>

            {/* FORM: grid 1 / 2 / 3 columnas */}
            <form
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 sm:px-10 pb-10"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Nombre: ocupa todo el ancho en cada breakpoint */}
              <div className="xl:col-span-3 md:col-span-2">
                <label
                  htmlFor="nombre"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre", {
                    required: "El nombre es obligatorio",
                  })}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  autoComplete="name"
                  disabled={isSubmitting}
                  placeholder="Ej. María Pérez"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Email: ocupa todo el ancho */}
              <div className="xl:col-span-3 md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Email no válido",
                    },
                  })}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder="tucorreo@dominio.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password: en grilla (1 col en móvil, 2 en md, 3 en xl junto con confirm) */}
              <div className="md:col-span-1 xl:col-span-1">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                  })}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="md:col-span-1 xl:col-span-1">
                <label
                  htmlFor="password2"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Repite la contraseña
                </label>
                <input
                  id="password2"
                  type="password"
                  {...register("password2", {
                    required: "Confirma tu contraseña",
                    validate: (v) =>
                      v === password || "Las contraseñas no coinciden",
                  })}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="Confirma tu contraseña"
                />
                {errors.password2 && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.password2.message}
                  </p>
                )}
              </div>

              {/* Botones: siempre a lo ancho */}
              <div className="xl:col-span-3 md:col-span-2 flex items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose?.()}
                  className="bg-blue hover:bg-gold text-white font-bold py-2 px-6 rounded-lg transition duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-yellow hover:bg-blue hover:text-white text-blue font-bold py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? "Registrando..." : "Crear cuenta"}
                </button>
              </div>

              <p className="xl:col-span-3 md:col-span-2 text-center text-xs text-gray-500 mt-2">
                Al registrarte aceptas los términos y el tratamiento de datos
                conforme a la política aplicable.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
