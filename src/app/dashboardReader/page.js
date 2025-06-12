"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toast, Toaster } from "react-hot-toast";
import PanelReader from "@/components/PanelReader";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
    padding: "16px",
    minWidth: "300px",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

const LectorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error("Debes iniciar sesión", toastStyle);
        router.push("/login");
        return;
      }

      const email = session.user.email;
      const nombre =
        session.user.user_metadata?.name ||
        session.user.user_metadata?.full_name ||
        "Lector";

      try {
        // Verificar si el usuario tiene un rol superior en usuarios
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("role")
          .eq("email", email)
          .maybeSingle();

        // Crear toasts interactivos para roles superiores
        if (usuario?.role === "Administrador") {
          const adminToast = toast(
            (t) => (
              <div style={toastStyle.style}>
                <p>¿Deseas ir al panel de Administrador?</p>
                <div
                  style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                >
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      router.push("/dashboard");
                    }}
                    style={{
                      background: "#1e3a8a",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Ir al panel
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      background: "#facc15",
                      color: "#1e3a8a",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Permanecer
                  </button>
                </div>
              </div>
            ),
            {
              duration: Infinity,
              icon: "🔑",
              ...toastStyle,
            }
          );
          return;
        } else if (usuario?.role === "Editor") {
          const editorToast = toast(
            (t) => (
              <div style={toastStyle.style}>
                <p>¿Deseas ir al panel de Editor?</p>
                <div
                  style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                >
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      router.push("/dashboard");
                    }}
                    style={{
                      background: "#1e3a8a",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Ir al panel
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      background: "#facc15",
                      color: "#1e3a8a",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Permanecer
                  </button>
                </div>
              </div>
            ),
            {
              duration: Infinity,
              icon: "✏️",
              ...toastStyle,
            }
          );
          return;
        }

        // El resto del código sigue igual...
        // [El código para verificar/crear lector y mostrar bienvenida se mantiene igual]

        // Revisar si ya es lector
        const { data: lectorExistente } = await supabase
          .from("lectores")
          .select("id, nombre, rol")
          .eq("email", email)
          .maybeSingle();

        let lector = lectorExistente;

        // Si no existe aún, registrarlo como lector
        if (!lector) {
          const { data: nuevoLector, error: insertError } = await supabase
            .from("lectores")
            .insert([
              {
                id: session.user.id,
                email,
                nombre,
                rol: "Lector",
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Error al insertar lector:", insertError);
            toast.error("No se pudo registrar como lector", toastStyle);
            router.push("/login");
            return;
          }

          lector = nuevoLector;
        }

        setUserData({
          primer_nombre: lector.nombre,
          role: lector.rol || "Lector",
        });

        toast.success("Bienvenido lector", toastStyle);
      } catch (e) {
        console.error("Error general al gestionar sesión:", e);
        toast.error("Error al cargar el perfil", toastStyle);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-right" />
      <header className="bg-blue text-white py-6 text-center">
        <h1 className="text-3xl font-bold">
          Bienvenido, {userData?.primer_nombre}
        </h1>
        <p className="text-xl text-yellow-300">Rol: {userData?.role}</p>
      </header>
      <main className="p-6 text-center">
        <PanelReader userData={userData} />
      </main>
    </div>
  );
};

export default LectorDashboard;
