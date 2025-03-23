"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AiOutlineHome,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineBook,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Indica si se está obteniendo el usuario
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("Error autenticando usuario:", authError);
          setRole(null);
          return;
        }

        console.log("Usuario autenticado:", user.id);

        const { data, error: userError } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id) // El 'id' en usuarios es el mismo UUID que en auth
          .single();

        if (userError) {
          console.error("Error obteniendo rol del usuario:", userError);
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

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
      {/* Botón de menú hamburguesa */}
      <button
        className="fixed top-4 left-4 z-50 text-3xl text-white bg-[var(--color-blue)] p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-64 bg-gray-100 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 shadow-lg h-screen flex flex-col`}
      >
        {/* Sección superior con el logo */}
        <div className="h-24 flex items-center justify-center border-b border-[var(--color-gray-300)] p-4 rounded-md mt-40">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Librería UG"
            width={200}
            height={100}
            className="object-contain rounded-md"
          />
        </div>

        {/* Menú */}
        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-6 p-6 text-[var(--color-blue)]">
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineHome size={24} />
              <Link href="/" className="block text-lg">
                Inicio
              </Link>
            </li>
            <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
              <AiOutlineBook size={24} />
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

            {/* Mostrar FAQ según el rol con el ícono correspondiente */}
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

        {/* Botón de Cerrar Sesión */}
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
