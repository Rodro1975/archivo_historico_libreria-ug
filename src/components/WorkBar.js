"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import {
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineBook,
  AiOutlineDashboard,
} from "react-icons/ai";
import ActualizarLibros from "@/components/ActualizarLibros";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";

const WorkBar = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.log("Sesión no válida, redirigiendo a /login");
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

    if (error) {
      console.error("Error fetching user data:", error.message);
    } else {
      setUserData(data);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
    } else {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const toggleForm = (formName) => {
    setActiveForm((prevForm) => (prevForm === formName ? null : formName));
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  if (loading) {
    return <h1 className="text-center mt-10">Cargando...</h1>;
  }

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
          <ul className="flex flex-col gap-4 p-6 text-blue dark:text-blue">
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
