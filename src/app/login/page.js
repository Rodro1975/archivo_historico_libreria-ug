"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import FormReader from "@/components/FormReader";
import TurnstileWidget from "@/components/TurnstileWidget";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [registroOpen, setRegistroOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // 1) Obtener token del widget
      const token = window?.turnstile?.getResponse?.();
      if (!token) {
        toastError("Completa la verificación de seguridad.");
        return;
      }

      // 2) Verificar en tu API
      const ver = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!ver.ok) {
        const info = await ver.json().catch(() => ({}));
        toastError(info?.error || "Verificación de seguridad fallida.");
        return;
      }

      // 3) Si el captcha es válido, procede con Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toastError(`Error: ${error.message}`);
        setError(error.message);
      } else {
        toastSuccess("Inicio de sesión exitoso");
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
      // Opcional: resetear el widget para siguientes intentos
      window?.turnstile?.reset?.();
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 items-center justify-center py-10">
          {/* Contenedor principal */}
          <div
            className="bg-gray-100 w-full max-w-sm rounded-lg shadow-lg p-4 sm:p-6 mx-auto"
            style={{ maxHeight: "90vh" }}
          >
            <div className="text-center mb-4">
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

              <h1 className="font-black text-2xl text-blue">Iniciar Sesión</h1>
            </div>

            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              autoComplete="on"
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-blue"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "El correo es obligatorio",
                })}
                autoComplete="email"
                className="mt-1 w-full border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2"
                required
              />
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.email.message}
                </p>
              )}

              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-blue"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="login-password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                autoComplete="current-password"
                className="mt-1 w-full border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2"
                required
              />

              {errors.password && (
                <p className="mt-1 text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}

              {error && <p className="mt-1 text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                className={`transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="text-center mt-4 text-sm">
              <Link
                href="/recuperar"
                className="text-sm text-blue hover:text-gold"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* Botones de inicio de sesión y creación de cuenta */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Google */}
              <button
                onClick={async () => {
                  const redirectUrl = `${window.location.origin}/dashboardReader`;

                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: redirectUrl,
                      queryParams: { prompt: "select_account" },
                    },
                  });

                  if (error) {
                    toastError("Error al iniciar con Google: " + error.message);
                  }
                }}
                className="flex items-center justify-center border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg"
                type="button"
                aria-label="Iniciar sesión con Google"
              >
                <i className="fab fa-google mr-2 text-red-600" />
                <span>Google</span>
              </button>

              {/* Crear cuenta (antes: Regístrate con otro correo) */}
              <button
                type="button"
                onClick={() => setRegistroOpen(true)}
                className="flex items-center justify-center border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg"
                aria-label="Crear cuenta con correo"
              >
                <i className="fas fa-user-plus mr-2 text-blue" />
                <span>Crear cuenta</span>
              </button>
              <div className="sm:col-span-2 flex justify-center mt-2">
                {/* 🔒 Widget Turnstile */}
                <TurnstileWidget />
              </div>
            </div>
            {/* Ayuda sobre opciones de registro (popover independiente) */}
            <div className="mt-2 relative flex justify-center">
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                aria-expanded={helpOpen}
                aria-controls="help-popover"
                className="inline-flex items-center gap-2 text-xs text-blue underline hover:opacity-80"
                title="¿Por qué registrarse con correo?"
              >
                <i className="fas fa-info-circle" />
                <span>¿Primera vez aquí?</span>
              </button>

              {helpOpen && (
                <div
                  id="help-popover"
                  role="dialog"
                  aria-labelledby="help-title"
                  className="absolute top-full mt-2 w-[min(22rem,90vw)] bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50
                 right-0 sm:left-1/2 sm:-translate-x-1/2"
                >
                  <p
                    id="help-title"
                    className="text-sm font-semibold text-blue"
                  >
                    Elige cómo crear tu cuenta
                  </p>
                  <ul className="mt-2 text-xs text-gray-700 space-y-1 list-disc pl-5">
                    <li>
                      <strong>Google (Gmail):</strong> si es tu primera vez,
                      creamos tu cuenta automáticamente con tu Gmail.
                    </li>
                    <li>
                      <strong>Otro correo o institucional (@ugto.mx):</strong>{" "}
                      usa <em>Crear cuenta</em> para registrarte con email y
                      contraseña.
                    </li>
                  </ul>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setHelpOpen(false)}
                      className="text-blue text-xs underline hover:opacity-80"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modal Footer */}
        <Footer />
      </div>
      {/* Modal registro lector */}
      <FormReader open={registroOpen} onClose={() => setRegistroOpen(false)} />
    </>
  );
};

export default LoginForm;
