// app/dashboardReader/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError, toastLoading } from "@/lib/toastUtils";
import { toast } from "react-hot-toast";
import PanelReader from "@/components/PanelReader";
import Image from "next/image";

// Vista previa "glassy" activada con /dashboardReader?preview=1
function GlassyPreview() {
  return (
    <main className="relative min-h-screen w-full isolate">
      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/interiorLib.JPG"
          alt="Interior Librería UG"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.25)" }}
        />
      </div>

      {/* Card glassy */}
      <section className="relative z-10 px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div
            className="
              relative rounded-3xl overflow-hidden
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              ring-1 ring-white/20 border border-white/20
              bg-white/10 backdrop-blur-2xl
              px-6 py-8 md:px-12 md:py-12
            "
          >
            <div
              className="absolute left-0 right-0 top-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-yellow), var(--color-orange), var(--color-gold))",
              }}
            />

            <div className="relative text-center mb-8">
              <Image
                src="/images/editorial-ug.png"
                alt="Editorial UG Logo"
                width={180}
                height={180}
                className="mx-auto mb-6"
                priority
              />
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                Vista previa · Glassy
              </h1>
              <p
                className="font-semibold"
                style={{ color: "var(--color-yellow)" }}
              >
                (solo se ve con ?preview=1)
              </p>
            </div>

            {/* Grid acciones (preview) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Destacada */}
              <div
                className="
                  group relative overflow-hidden rounded-2xl p-6 md:col-span-2
                  transition-all hover:scale-[1.01] hover:shadow-2xl
                  border border-white/15 bg-white/10 backdrop-blur-xl
                "
              >
                <div
                  className="absolute inset-y-0 left-0 w-1/2 -skew-x-6 opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-blue), rgba(255,255,255,0))",
                  }}
                />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center ring-1 ring-white/20"
                    style={{ backgroundColor: "var(--color-blue)" }}
                  >
                    <span
                      className="text-3xl"
                      style={{ color: "var(--color-yellow)" }}
                    >
                      🔍
                    </span>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-white text-2xl font-bold tracking-tight">
                      Buscar libros
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Catálogo • título, autor, ISBN, año…
                    </p>
                  </div>
                </div>
              </div>

              {/* Compactas */}
              {[
                {
                  icon: "📥",
                  title: "Ver solicitudes",
                  color: "var(--color-yellow)",
                },
                {
                  icon: "📝",
                  title: "Crear solicitud",
                  color: "var(--color-blue)",
                },
                {
                  icon: "❓",
                  title: "Información",
                  color: "var(--color-yellow)",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="
                    group relative overflow-hidden rounded-2xl p-6
                    transition-all hover:scale-[1.01] hover:shadow-2xl
                    border border-white/15 bg-white/10 backdrop-blur-xl
                  "
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center ring-1 ring-white/20"
                      style={{ backgroundColor: b.color }}
                    >
                      <span
                        className="text-2xl"
                        style={{ color: "var(--color-blue)" }}
                      >
                        {b.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{b.title}</h4>
                      <p className="text-white/75 text-xs">Preview</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Logout (decorativo en preview) */}
              <div
                className="
                  group relative overflow-hidden rounded-2xl p-5 md:col-span-3
                  transition-all hover:scale-[1.005] hover:shadow-2xl
                  border border-white/15 bg-white/5 backdrop-blur-xl
                "
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-xl text-white">🚪</span>
                  <span className="text-white font-semibold">
                    Cerrar sesión
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const LectorDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useSearchParams();
  const preview = params?.get("preview") === "1";

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
        // Verificar rol superior
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("role")
          .eq("email", email)
          .maybeSingle();

        if (usuario?.role === "Administrador") {
          toast(
            (t) => (
              <div style={{ padding: 6 }}>
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
              <div style={{ padding: 6 }}>
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

        // Revisar/crear lector
        const { data: lectorExistente } = await supabase
          .from("lectores")
          .select("id, nombre, rol")
          .eq("email", email)
          .maybeSingle();

        let lector = lectorExistente;

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
    // Si ?preview=1, mostramos el glassy demo; sino, tu PanelReader real
    <div className="min-h-screen bg-transparent">
      {preview ? <GlassyPreview /> : <PanelReader userData={userData} />}
    </div>
  );
};

export default LectorDashboard;
