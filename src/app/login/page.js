"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import supabase from "@/lib/supabase";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(`Error: ${error.message}`);
      setError(error.message);
    } else {
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
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
              <Link href="#" className="text-sm text-blue hover:text-gold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* Botones sociales en una sola fila */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo:
                        "https://archivo-historico-libreria-ug-supabase.vercel.app/dashboard",
                    },
                  });
                  if (error) {
                    toast.error(
                      "Error al iniciar con Google: " + error.message
                    );
                  }
                }}
                className="flex-1 flex items-center justify-center border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg"
              >
                <i className="fab fa-google mr-2 text-red-600"></i>
                <span>Google</span>
              </button>

              <button className="flex-1 flex items-center justify-center border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg flex items-center justify-center">
                <i className="fab fa-linkedin mr-2 text-blue-700"></i>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default LoginForm;
