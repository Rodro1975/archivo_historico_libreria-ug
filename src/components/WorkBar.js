"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  AiOutlineBell,
  AiOutlineLogout,
  AiOutlineBook,
  AiOutlineDashboard,
} from "react-icons/ai";
import ActualizarLibros from "@/components/ActualizarLibros";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";
import NotificacionesDropdown from "./NotificacionesDropdown"; // ajuste la ruta si es necesario

const WorkBar = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Sesión y datos de usuario
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/login");
      } else {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("primer_nombre, apellido_paterno, role, foto")
      .eq("id", userId)
      .single();
    if (!error) setUserData(data);
  };

  // Contar notificaciones no leídas tras cargar userData
  useEffect(() => {
    if (!userData) return;
    const fetchCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let query = supabase
        .from("notificaciones")
        .select("*")
        .eq("read", false)
        .eq("user_id", user.id);
      // filtro según rol
      if (userData.role === "Editor") {
        query = query.eq("type", "libros");
      }
      const { data, error } = await query;
      if (!error) setNotificationCount(data.length);
    };
    fetchCount();
  }, [userData]);

  // Suscripción a nuevas notificaciones
  useEffect(() => {
    if (!userData) return;
    const handleNew = (payload) => setNotificationCount((prev) => prev + 1);
    const filter =
      userData.role === "Administrador"
        ? "type.eq.usuarios,type.eq.libros"
        : "type.eq.libros";
    const channel = supabase
      .channel("notificaciones")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificaciones",
          filter,
        },
        handleNew
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [userData]);

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Cambio de formulario y sidebar
  const toggleForm = (formName) =>
    setActiveForm((prev) => (prev === formName ? null : formName));
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  const userRole = userData?.role;

  return (
    <div className="relative">
      {/* Botón hamburguesa */}
      <button
        className="fixed top-4 left-4 z-50 text-3xl text-white bg-[var(--color-blue)] p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Barra superior */}
      <div
        className={`bg-white dark:bg-[#1f2937] shadow-md border-b border-gray-300 fixed top-0 left-0 w-full py-4 flex items-center justify-center z-30 ${
          isOpen ? "hidden" : "block"
        }`}
      >
        <Image
          src="/images/editorial-ug.png"
          alt="Logo editorial GTO"
          width={200}
          height={200}
        />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#111827] shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 flex flex-col`}
      >
        {/* Logo lateral */}
        <div className="h-24 flex items-center justify-center border-b border-[var(--color-gray-300)] p-4 mt-40">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Librería UG"
            width={200}
            height={100}
            className="object-contain rounded-md"
          />
        </div>

        {/* Menú con scroll */}
        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-6 p-6 text-[var(--color-blue)]">
            {/* Notificaciones (reemplaza Inicio) */}
            <li className="relative flex items-center gap-4 hover:text-[var(--color-orange)]">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-4 text-lg"
              >
                <AiOutlineBell size={24} />
                Notificaciones
              </button>
              {notificationCount > 0 && (
                <span className="absolute -top-2 left-6 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </li>
            {/* Dropdown de Notificaciones (fuera del botón, como en Sidebar) */}
            <NotificacionesDropdown
              show={showDropdown}
              onClose={() => setShowDropdown(false)}
            />

            {/* Galería del Editor */}
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineBook size={24} />
              <Link href="/catalogoCompleto" className="block text-lg">
                Galería del Editor
              </Link>
            </li>

            {/* Opciones según rol */}
            {userRole === "Administrador" && (
              <>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/mostrarLibros" className="block text-lg">
                    Lista de Libros
                  </Link>
                </li>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/registerBook" className="block text-lg">
                    Registrar Libros
                  </Link>
                </li>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/mostrarUsuarios" className="block text-lg">
                    Lista de Usuarios
                  </Link>
                </li>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/register" className="block text-lg">
                    Registrar Usuarios
                  </Link>
                </li>
              </>
            )}

            {userRole === "Editor" && (
              <>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/mostrarLibros" className="block text-lg">
                    Lista de Libros
                  </Link>
                </li>
                <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                  <AiOutlineBook size={24} />
                  <Link href="/registerBook" className="block text-lg">
                    Registrar Libros
                  </Link>
                </li>
              </>
            )}

            {/* Dashboard */}
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineDashboard size={24} />
              <Link href="/dashboard" className="block text-lg">
                Volver al Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Cerrar sesión fijo al pie */}
        <div className="p-6 border-t border-[var(--color-gray-300)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 text-lg text-red-700 w-full"
          >
            <AiOutlineLogout size={24} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Formularios activos */}
      {activeForm === "actualizarLibros" && (
        <div className="mt-20 p-6">
          <ActualizarLibros onCancel={() => setActiveForm(null)} />
        </div>
      )}
      {activeForm === "actualizarUsuarios" && (
        <div className="mt-20 p-6">
          <ActualizarUsuarios onCancel={() => setActiveForm(null)} />
        </div>
      )}
    </div>
  );
};

export default WorkBar;
