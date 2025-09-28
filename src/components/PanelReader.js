// src/components/PanelReader.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError, toastLoading } from "@/lib/toastUtils";
import { toast } from "react-hot-toast";
import ModalInformacion from "@/components/ModalInformacion";
import ModalBuscarLibros from "@/components/ModalBuscarLibros";
import ModalSolicitudes from "./ModalSolicitudes";
import ModalVerSolicitudes from "./ModalVerSolicitudes";
import EditorialLogo from "./EditorialLogo";

const PanelReader = ({ userData }) => {
  const router = useRouter();
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [modalBuscarOpen, setModalBuscarOpen] = useState(false);
  const [ModalSolicitudesOpen, setModalSolicitudesOpen] = useState(false);
  const [modalVerSolicitudesOpen, setModalVerSolicitudesOpen] = useState(false);
  const [lectorId, setLectorId] = useState(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setLectorId(user?.id || null);
    };
    getUserId();
  }, []);

  const handleLogout = async () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-4 p-4">
          <p className="font-bold" style={{ color: "var(--color-blue)" }}>
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
                const toastId = toastLoading("Cerrando sesión...", {
                  duration: Infinity,
                });
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toastError(
                    "Error al cerrar sesión: " + error.message,
                    toastId
                  );
                } else {
                  toastSuccess("Sesión cerrada correctamente", { id: toastId });
                  router.push("/login");
                }
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleOpenBuscarLibros = () => {
    setModalBuscarOpen(true);
    if (!hasShownToast.current) {
      toastSuccess("Libros cargados correctamente");
      hasShownToast.current = true;
    }
  };

  const handleOpenSolicitudes = () => {
    setModalSolicitudesOpen(true);
    if (!hasShownToast.current) {
      toastSuccess("Crea tu solicitud");
      hasShownToast.current = true;
    }
  };

  const handleOpenVerSolicitudes = () => {
    setModalVerSolicitudesOpen(true);
    toastSuccess("Mostrando tus solicitudes");
  };

  return (
    <main className="relative min-h-screen w-full isolate">
      {/* Fondo a pantalla completa */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/interiorLib.JPG"
          alt="Interior Librería UG"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay con leve tinte para contraste */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.25)" }}
        />
      </div>

      {/* Contenedor glassy principal (estilo Wattly) */}
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
            {/* Borde superior de acento (gradiente de marca) */}
            <div
              className="absolute left-0 right-0 top-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-yellow) 0%, var(--color-orange) 50%, var(--color-gold) 100%)",
              }}
            />

            {/* Glow decorativo */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-20 opacity-30 blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.15), rgba(255,255,255,0) 70%), radial-gradient(40% 40% at 80% 10%, rgba(255,255,255,0.08), rgba(255,255,255,0) 70%)",
              }}
            />

            {/* Encabezado con logo y saludo */}
            <div className="relative text-center mb-8">
              <EditorialLogo />

              {userData?.primer_nombre && (
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                    Bienvenido, {userData.primer_nombre}
                  </h1>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-yellow)" }}
                  >
                    Rol: {userData?.role || "Lector"}
                  </p>
                </div>
              )}
            </div>

            {/* Grid impactante: una tarjeta "destacada" + 3 regulares + logout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Buscar Libros (destacada, ocupa 2 columnas en md+) */}
              <button
                onClick={handleOpenBuscarLibros}
                className="
                  group relative overflow-hidden rounded-2xl p-6 md:col-span-2
                  transition-all hover:scale-[1.01] hover:shadow-2xl
                  border border-white/15 bg-white/10 backdrop-blur-xl
                "
              >
                {/* Decor brand diagonal */}
                <div
                  className="absolute inset-y-0 left-0 w-1/2 -skew-x-6 opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-blue) 0%, rgba(255,255,255,0) 70%)",
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
                      Catálogo institucional • título, autor, ISBN, año…
                    </p>
                  </div>
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
                  }}
                />
              </button>

              {/* Ver solicitudes */}
              <button
                onClick={handleOpenVerSolicitudes}
                disabled={!lectorId}
                className="
                  group relative overflow-hidden rounded-2xl p-6
                  transition-all hover:scale-[1.01] hover:shadow-2xl
                  border border-white/15 bg-white/10 backdrop-blur-xl
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center ring-1 ring-white/20"
                    style={{ backgroundColor: "var(--color-yellow)" }}
                  >
                    <span
                      className="text-2xl"
                      style={{ color: "var(--color-blue)" }}
                    >
                      📥
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      Ver solicitudes
                    </h4>
                    <p className="text-white/75 text-xs">
                      Revisa el estado y el historial
                    </p>
                  </div>
                </div>
              </button>

              {/* Crear solicitudes */}
              <button
                onClick={handleOpenSolicitudes}
                className="
                  group relative overflow-hidden rounded-2xl p-6
                  transition-all hover:scale-[1.01] hover:shadow-2xl
                  border border-white/15 bg-white/10 backdrop-blur-xl
                "
              >
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center ring-1 ring-white/20"
                    style={{ backgroundColor: "var(--color-blue)" }}
                  >
                    <span
                      className="text-2xl"
                      style={{ color: "var(--color-yellow)" }}
                    >
                      📝
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">
                      Crear solicitud
                    </h4>
                    <p className="text-white/75 text-xs">
                      Pide material o asistencia
                    </p>
                  </div>
                </div>
              </button>

              {/* Información */}
              <button
                onClick={() => setModalInfoOpen(true)}
                className="
                  group relative overflow-hidden rounded-2xl p-6
                  transition-all hover:scale-[1.01] hover:shadow-2xl
                  border border-white/15 bg-white/10 backdrop-blur-xl
                "
              >
                <div className="relative z-10 flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center ring-1 ring-white/20"
                    style={{ backgroundColor: "var(--color-yellow)" }}
                  >
                    <span
                      className="text-2xl"
                      style={{ color: "var(--color-blue)" }}
                    >
                      ❓
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Información</h4>
                    <p className="text-white/75 text-xs">
                      Ayuda y guía del panel
                    </p>
                  </div>
                </div>
              </button>

              {/* Cerrar sesión (full width) */}
              <button
                onClick={handleLogout}
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
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modales */}
      {modalBuscarOpen && (
        <ModalBuscarLibros
          open={modalBuscarOpen}
          onClose={() => setModalBuscarOpen(false)}
        />
      )}
      {ModalSolicitudesOpen && (
        <ModalSolicitudes
          open={ModalSolicitudesOpen}
          onClose={() => setModalSolicitudesOpen(false)}
        />
      )}
      {modalInfoOpen && (
        <ModalInformacion
          open={modalInfoOpen}
          onClose={() => setModalInfoOpen(false)}
        />
      )}
      {modalVerSolicitudesOpen && lectorId && (
        <ModalVerSolicitudes
          open={modalVerSolicitudesOpen}
          onClose={() => setModalVerSolicitudesOpen(false)}
          lectorId={lectorId}
        />
      )}
    </main>
  );
};

export default PanelReader;
