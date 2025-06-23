"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetearPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        toast.success("Ingresa tu nueva contraseña");
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success("Contraseña actualizada con éxito");
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gray-50 px-4">
      <Toaster position="top-center" />
      <div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6">
        <h1 className="text-blue text-2xl font-bold mb-4 text-center">
          Restablecer Contraseña
        </h1>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border border-yellow rounded-lg px-3 py-2 text-blue text-sm focus:ring-2 focus:ring-gold focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-yellow rounded-lg px-3 py-2 text-blue text-sm focus:ring-2 focus:ring-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-yellow text-blue font-semibold rounded-lg hover:bg-blue hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
