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
      <div className="flex items-center justify-center min-h-screen mt-10 mb-10">
        <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-3xl rounded-lg shadow-lg">
          <div className="p-10 xs:p-0 mx-auto w-full">
            <div className="px-5 py-7 text-center">
              <div className="flex justify-center mb-5">
                <Image
                  src="/images/escudo-png.png"
                  alt="Escudo"
                  className="h-20"
                  width={100}
                  height={100}
                  priority
                />
              </div>

              <h1 className="font-black text-3xl mb-5 text-gold">
                Iniciar Sesión
              </h1>

              <form
                className="flex flex-col items-center"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="on"
              >
                <label
                  htmlFor="email"
                  className="font-semibold text-sm text-blue pb-1 block text-left w-full"
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
                  className="border border-yellow rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none"
                  required
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email.message}</p>
                )}

                <label
                  htmlFor="login-password"
                  className="font-semibold text-sm text-blue pb-1 block text-left w-full"
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
                  className="border border-yellow rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none"
                  required
                />
                {errors.password && (
                  <p className="text-red-500">{errors.password.message}</p>
                )}

                {error && <p className="text-red-500">{error}</p>}

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
                <Link href="#" className="text-blue hover:text-gold">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div className="text-center py-4">
              <span className="text-blue-900">o</span>
            </div>

            <div className="p-5 flex justify-between space-x-3">
              <button className="transition duration-200 border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg flex items-center justify-center">
                <i className="fab fa-google mr-2 text-red-600"></i>
                <span>Google</span>
              </button>
              <button className="transition duration-200 border border-gray-200 text-gray-900 w-full py-2.5 rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg flex items-center justify-center">
                <i className="fab fa-linkedin mr-2 text-blue-700"></i>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginForm;
