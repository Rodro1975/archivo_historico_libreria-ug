"use client";

import React from "react";
import { toast, Toaster } from "react-hot-toast";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

const toastStyle = {
  style: {
    background: "#facc15", // Naranja
    color: "#1e3a8a", // Azul
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a", // Azul
    secondary: "#facc15", // Naranja
  },
};

const PanelReader = ({ userData }) => {
  const router = useRouter();

  const handleLogout = async () => {
    // Mostrar toast de confirmación con botones personalizados
    const confirmId = toast(
      (t) => (
        <div className="flex flex-col gap-4 p-4">
          <p className="font-bold text-blue-900">
            ¿Estás seguro que quieres cerrar sesión?
          </p>
          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
            <button
              className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                const toastId = toast.loading("Cerrando sesión...", toastStyle);
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast.error("Error al cerrar sesión: " + error.message, {
                    id: toastId,
                    ...toastStyle,
                  });
                } else {
                  toast.success("Sesión cerrada correctamente", {
                    id: toastId,
                    ...toastStyle,
                  });
                  router.push("/login");
                }
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "#facc15",
          color: "#1e3a8a",
          fontWeight: "bold",
          minWidth: "320px",
        },
        iconTheme: {
          primary: "#1e3a8a",
          secondary: "#facc15",
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <Toaster position="top-right" />
      <div className="bg-gradient-to-br from-blue to-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto mt-4 border border-blue">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange to-yellow bg-clip-text text-transparent mb-3">
            Panel del Lector
          </h2>
          <p className="text-gold text-lg">
            Bienvenido, {userData?.primer_nombre}
          </p>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Botón 1 */}
          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-yellow group-hover:rotate-12 transition-transform">
                🔍
              </span>
              <span className="text-yellow font-medium">Buscar documentos</span>
            </div>
            <div className="absolute inset-0 bg-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          {/* Botón 2 */}
          <button className="group relative overflow-hidden rounded-xl bg-yellow p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-blue group-hover:rotate-12 transition-transform">
                📥
              </span>
              <span className="text-blue font-medium">Ver solicitudes</span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          {/* Botón 3 */}
          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-yellow group-hover:rotate-12 transition-transform">
                📝
              </span>
              <span className="text-yellow font-medium">Solicitar visita</span>
            </div>
            <div className="absolute inset-0 bg-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          {/* Botón 4 */}
          <button className="group relative overflow-hidden rounded-xl bg-yellow p-6 transition-all hover:shadow-lg hover:scale-105">
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-blue group-hover:rotate-12 transition-transform">
                ❓
              </span>
              <span className="text-blue font-medium">Pedir información</span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          {/* Botón 5 (Cerrar sesión) */}
          <button
            onClick={handleLogout}
            className="group relative overflow-hidden rounded-xl bg-red-600 p-6 col-span-full transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-white group-hover:rotate-12 transition-transform">
                🚪
              </span>
              <span className="text-white font-medium">Cerrar sesión</span>
            </div>
            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>
        </div>

        {/* Elemento decorativo */}
        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 100C0 44.7715 44.7715 0 100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100Z"
              fill="gold"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PanelReader;
