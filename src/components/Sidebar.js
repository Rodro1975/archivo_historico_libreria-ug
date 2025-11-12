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
import EditorialLogo from "./EditorialLogo";
import ModalCorreo from "./ModalCorreo";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { toast } from "react-hot-toast";
import NotificacionesPanel from "./NotificacionesPanel";
// Componente Sidebar
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [modalCorreoOpen, setModalCorreoOpen] = useState(false);
  const router = useRouter();
  // Obtener el rol del usuario al montar el componente
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
        // Obtener el rol desde la tabla "usuarios"
        const { data, error } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error obteniendo rol del usuario:", error);
          setRole(null);
        } else {
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
  // Obtener el conteo de notificaciones no leídas
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !role) return;

        let query = supabase
          .from("notificaciones")
          .select("*")
          .eq("read", false)
          .eq("user_id", user.id);

        if (role === "Administrador") {
          query = query.in("type", ["usuarios", "libros", "autores"]);
        } else if (role === "Editor") {
          query = query.in("type", ["libros", "autores"]);
        }

        const { data, error } = await query;

        if (!error) {
          setNotificationCount(data.length);
        }
      } catch (error) {
        console.error("Error en fetchNotificationCount:", error);
      }
    };

    if (role) fetchNotificationCount();
  }, [role]);
  // Suscribirse a cambios en notificaciones
  useEffect(() => {
    let unsubscribe = null;

    const handleNewNotification = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !role) return;

      let query = supabase
        .from("notificaciones")
        .select("*")
        .eq("read", false)
        .eq("user_id", user.id);

      if (role === "Administrador") {
        query = query.in("type", ["usuarios", "libros", "autores"]);
      } else if (role === "Editor") {
        query = query.in("type", ["libros", "autores"]);
      }

      const { data, error } = await query;

      if (!error) {
        setNotificationCount(data.length);
      }
    };
    // Configurar la suscripción a notificaciones
    const subscribeToNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !role) return;

      const filter =
        role === "Administrador"
          ? "type.in.(usuarios,libros,autores)"
          : "type.in.(libros,autores)";

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
          handleNewNotification
        )
        .subscribe();

      unsubscribe = () => channel.unsubscribe();
    };

    if (role) subscribeToNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [role]);
  // Obtener el email del usuario al montar el componente
  useEffect(() => {
    const fetchUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) setUserEmail(user.email);
    };
    fetchUserEmail();
  }, []);
  // Obtener la URL del webmail según el dominio del email
  const getWebmailUrl = (email) => {
    if (!email) return "#";
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (domain === "ugto.mx") return "https://outlook.office.com/mail/";
    if (domain === "gmail.com") return "https://mail.google.com/";
    return "https://outlook.office.com/mail/";
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  // Manejar el cierre de sesión
  const handleLogout = async () => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          <span>¿Estás seguro de que quieres cerrar sesión?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const { error } = await supabase.auth.signOut();

                if (error) {
                  toastError("Error al cerrar sesión.");
                  console.error("Error al cerrar sesión:", error);
                } else {
                  toastSuccess("Sesión cerrada exitosamente.");
                  router.push("/login");
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Sí
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              No
            </button>
          </div>
        </span>
      ),
      { duration: 10000 }
    );
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
        <div className="h-24 flex items-center justify-start border-b border-[var(--color-gray-300)] p-4 rounded-md mt-40">
          <EditorialLogo
            className="scale-[.8] origin-left shrink-0"
            imageClassName="h-12 w-auto"
            priority
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
            <NotificacionesPanel
              open={showDropdown}
              onClose={() => setShowDropdown(false)}
              role={role}
            />

            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineAppstore size={24} />

              <Link href="/catalogoCompleto" className="block text-lg">
                Galería del Editor
              </Link>
            </li>
            <li
              className="flex items-center gap-4 hover:text-[var(--color-orange)] cursor-pointer"
              onClick={() => setModalCorreoOpen(true)}
            >
              <AiOutlineMail size={24} />
              <span className="block text-lg">Correo</span>
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
      {/* Modal de Correo */}
      <ModalCorreo
        email={userEmail}
        webmailUrl={getWebmailUrl(userEmail)}
        isOpen={modalCorreoOpen}
        onClose={() => setModalCorreoOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
