"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AiOutlineBell,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineQuestionCircle,
  AiOutlineAppstore,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import NotificacionesDropdown from "./NotificacionesDropdown";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Obtener el rol del usuario autenticado y su ID
  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("No se encontró usuario autenticado");
          setRole(null);
          return;
        }

        console.log("Usuario autenticado (UUID):", user.id);

        const { data, error } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error obteniendo rol del usuario:", error);
          setRole(null);
        } else {
          console.log("Rol obtenido:", data.role);
          setRole(data.role);
        }
      } catch (error) {
        console.error("Error en fetchUserRole:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // Obtener la cantidad inicial de notificaciones no leídas según el rol
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !role) {
          console.error("No se encontró usuario autenticado o rol indefinido");
          return;
        }

        console.log("Obteniendo notificaciones para user_id:", user.id);

        const query = supabase
          .from("notificaciones")
          .select("*")
          .eq("read", false)
          .eq("user_id", user.id);

        if (role === "Editor") {
          query.eq("type", "libros");
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error obteniendo notificaciones:", error);
        } else {
          setNotificationCount(data.length);
        }
      } catch (error) {
        console.error("Error en fetchNotificationCount:", error);
      }
    };

    if (role) {
      fetchNotificationCount();
    }
  }, [role]);

  // Suscribirse a cambios en la tabla "notificaciones" con filtrado según el rol
  useEffect(() => {
    const handleNewNotification = (payload) => {
      console.log("Nueva notificación recibida:", payload);
      setNotificationCount((prev) => prev + 1);
    };

    const subscribeToNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !role) return;

      const filter =
        role === "Administrador"
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
            filter: filter,
          },
          handleNewNotification
        )
        .subscribe();

      return () => {
        console.log("Desuscribiendo canal...");
        channel.unsubscribe();
      };
    };

    if (role) {
      subscribeToNotifications();
    }
  }, [role]);

  // Botón de hamburguesa para abrir/cerrar el menú lateral
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      const confirmLogout = window.confirm(
        "¿Estás seguro de que quieres cerrar sesión?"
      );
      if (!confirmLogout) return;

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("Sesión cerrada exitosamente");
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div>
      <button
        className="fixed top-4 left-4 z-50 text-3xl text-white bg-[var(--color-blue)] p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <div
        className={`fixed top-0 left-0 w-64 bg-gray-100 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 shadow-lg h-screen flex flex-col`}
      >
        <div className="h-24 flex items-center justify-center border-b border-[var(--color-gray-300)] p-4 rounded-md mt-40">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Librería UG"
            width={200}
            height={100}
            className="object-contain rounded-md"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-6 p-6 text-[var(--color-blue)]">
            <li className="relative flex items-center gap-4 hover:text-[var(--color-orange)]">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
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

            {/* Dropdown de Notificaciones */}
            <NotificacionesDropdown
              show={showDropdown}
              onClose={() => setShowDropdown(false)}
            />

            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineAppstore size={24} />

              <Link href="/catalogoCompleto" className="block text-lg">
                Galería del Editor
              </Link>
            </li>
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineMail size={24} />
              <Link href="#" target="_blank" className="block text-lg">
                Correo
              </Link>
            </li>
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineUser size={24} />
              <Link href="/profile" className="block text-lg">
                Perfil
              </Link>
            </li>

            {!loading && role === "Administrador" && (
              <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                <AiOutlineQuestionCircle size={24} />
                <Link href="/fAQsAdmin" className="block text-lg">
                  FAQs (Admin)
                </Link>
              </li>
            )}
            {!loading && role === "Editor" && (
              <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
                <AiOutlineQuestionCircle size={24} />
                <Link href="/fAQsEditor" className="block text-lg">
                  FAQs (Editor)
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="p-6 border-t border-[var(--color-gray-300)]">
          <button
            className="flex items-center gap-4 text-lg text-red-700 w-full"
            onClick={handleLogout}
          >
            <AiOutlineLogout size={24} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
