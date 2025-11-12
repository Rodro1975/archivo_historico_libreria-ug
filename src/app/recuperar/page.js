"use client";

import { useState } from "react";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Página para que el usuario pueda solicitar el reseteo de su contraseña
export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Maneja el envío del formulario para solicitar el reseteo de contraseña
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/resetear`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      toastError(`Error: ${error.message}`);
    } else {
      toastSuccess("Revisa tu correo para restablecer tu contraseña", {
        duration: 6000,
      });
      setEmail("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gray-50 px-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6">
        <div className="text-center">
          <Image
            src="/images/escudo-png.png"
            alt="Escudo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-blue text-2xl font-bold mb-4">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-gray-700 text-sm mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-yellow rounded-lg px-3 py-2 text-blue text-sm focus:ring-2 focus:ring-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow text-blue font-semibold rounded-lg hover:bg-blue hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
    </div>
  );
}
