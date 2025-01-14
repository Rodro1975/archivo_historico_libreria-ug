"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AiOutlineHome,
  AiOutlineMail,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineBook,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("Sesión cerrada exitosamente");
      router.push("/login"); // Redirigir a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-40 shadow-lg`}
      >
        {/* Sección superior con el logo */}
        <div className="h-24 flex items-center justify-center border-b border-[var(--color-orange)] p-4 rounded-md mt-40">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Librería UG"
            width={200}
            height={100}
            className="object-contain rounded-md"
          />
        </div>

        {/* Menú */}
        <ul className="flex flex-col gap-6 p-6 text-[var(--color-blue)]">
          <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
            <AiOutlineHome size={24} />
            <Link href="/" className="block text-lg">
              Inicio
            </Link>
          </li>
          {/* Botón para la Galería del Editor */}
          <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
            <AiOutlineBook size={24} />
            <Link href="/catalogoCompleto" className="block text-lg">
              Galería del Editor
            </Link>
          </li>
          <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
            <AiOutlineMail size={24} />
            <Link
              href="#" //aqui va el correo institucional al que sera redireccionado el usuario
              target="_blank"
              className="block text-lg"
            >
              Correo
            </Link>
          </li>
          <li className="flex items-center gap-4 hover:text-[var(--color-orange)]">
            <AiOutlineUser size={24} />
            <Link href="/profile" className="block text-lg">
              Perfil
            </Link>
          </li>
          <li className="flex items-center gap-4 hover:text-red-700">
            <AiOutlineLogout size={24} />
            <button
              className="block text-lg"
              onClick={handleLogout} // Llama a la función handleLogout
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
