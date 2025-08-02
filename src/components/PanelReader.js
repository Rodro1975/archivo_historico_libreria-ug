"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError, toastLoading } from "@/lib/toastUtils";
import ModalInformacion from "@/components/ModalInformacion";
import ModalBuscarLibros from "@/components/ModalBuscarLibros";
import ModalSolicitudes from "./ModalSolicitudes";
import ModalVerSolicitudes from "./ModalVerSolicitudes";

const PanelReader = ({ userData }) => {
  const router = useRouter();
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [modalBuscarOpen, setModalBuscarOpen] = useState(false);
  const [ModalSolicitudesOpen, setModalSolicitudesOpen] = useState(false);
  const [modalVerSolicitudesOpen, setModalVerSolicitudesOpen] = useState(false);
  const [lectorId, setLectorId] = useState(null);
  const hasShownToast = useRef(false);

  // Obtener el UID del usuario autenticado al montar el componente
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
    toastSuccess(
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
                const toastId = toastLoading("Cerrando sesión...");
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toastError(
                    "Error al cerrar sesión: " + error.message,
                    toastId
                  );
                } else {
                  toastSuccess("Sesión cerrada correctamente", toastId);
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
    <div className="min-h-screen bg-gray-50 p-4 relative">
      <div className="bg-gradient-to-br from-blue to-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto mt-4 border border-blue">
        <div className="text-center mb-10">
          <Image
            src="/images/editorial-ug.png"
            alt="Editorial UG Logo"
            width={200}
            height={200}
            className="mx-auto mb-6 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={handleOpenBuscarLibros}
            className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-yellow group-hover:rotate-12 transition-transform">
                🔍
              </span>
              <span className="text-yellow font-medium">Buscar Libros</span>
            </div>
            <div className="absolute inset-0 bg-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button
            onClick={handleOpenVerSolicitudes}
            className="group relative overflow-hidden rounded-xl bg-yellow p-6 transition-all hover:shadow-lg hover:scale-105"
            disabled={!lectorId}
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-blue group-hover:rotate-12 transition-transform">
                📥
              </span>
              <span className="text-blue font-medium">Ver solicitudes</span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button
            onClick={handleOpenSolicitudes}
            className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-yellow group-hover:rotate-12 transition-transform">
                📝
              </span>
              <span className="text-yellow font-medium">Crear Solicitudes</span>
            </div>
            <div className="absolute inset-0 bg-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button
            onClick={() => setModalInfoOpen(true)}
            className="group relative overflow-hidden rounded-xl bg-yellow p-6 transition-all hover:shadow-lg hover:scale-105"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-4xl text-blue group-hover:rotate-12 transition-transform">
                ❓
              </span>
              <span className="text-blue font-medium">Información</span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

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

        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <path
              d="M0 100C0 44.7715 44.7715 0 100 0C155.228 0 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100Z"
              fill="gold"
            />
          </svg>
        </div>
      </div>

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
    </div>
  );
};

export default PanelReader;
