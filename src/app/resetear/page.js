"use client";

import { useEffect, useState } from "react";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetearPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Recuperar sesión desde el hash de la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          supabase.auth
            .recoverSessionFromUrl(window.location.href)
            .then(({ data, error }) => {
              if (error) {
                toastError("Error al recuperar la sesión");
              } else {
                toastSuccess("✅ Puedes cambiar tu contraseña");
              }
            });
        } else {
          toastSuccess("✅ Puedes cambiar tu contraseña");
        }
      });
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toastError("❌ Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toastError(`Error: ${error.message}`);
    } else {
      toastSuccess("✅ Contraseña actualizada con éxito");
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gray-50 px-4">
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
            minLength={6}
            className="w-full border border-yellow rounded-lg px-3 py-2 text-blue text-sm focus:ring-2 focus:ring-gold focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
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
