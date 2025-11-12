// app/dashboardReader/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { toast } from "react-hot-toast";
import PanelReader from "@/components/PanelReader";

const LectorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  //identifica el rol del usuario y muestra el panel correspondiente
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toastError("Debes iniciar sesión");
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

        // Toasts interactivos para roles superiores (sin toastStyle)
        if (usuario?.role === "Administrador") {
          toast(
            (t) => (
              <div style={{ padding: 8 }}>
                <p>¿Deseas ir al panel de Administrador?</p>
                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
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
                      borderRadius: 4,
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
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Permanecer
                  </button>
                </div>
              </div>
            ),
            { duration: Infinity, icon: "🔑" }
          );
          return;
        } else if (usuario?.role === "Editor") {
          toast(
            (t) => (
              <div style={{ padding: 8 }}>
                <p>¿Deseas ir al panel de Editor?</p>
                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
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
                      borderRadius: 4,
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
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Permanecer
                  </button>
                </div>
              </div>
            ),
            { duration: Infinity, icon: "✏️" }
          );
          return;
        }

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
            toastError("No se pudo registrar como lector");
            router.push("/login");
            return;
          }

          lector = nuevoLector;
        }

        setUserData({
          primer_nombre: lector.nombre,
          role: lector.rol || "Lector",
        });

        toastSuccess("Bienvenido lector");
      } catch (e) {
        console.error("Error general al gestionar sesión:", e);
        toastError("Error al cargar el perfil");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  return (
    // 👇 Sin fondo gris ni header: dejamos que el PanelReader controle el diseño
    <div className="min-h-screen">
      <PanelReader userData={userData} />
    </div>
  );
};

export default LectorDashboard;
