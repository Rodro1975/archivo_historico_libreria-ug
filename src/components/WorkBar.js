import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { decode } from "jsonwebtoken";
import BookForm from "./BookForm";

const WorkBar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [isResearch, setIsResearch] = useState(false);
  const [isReader, setIsReader] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false); // Estado para mostrar/ocultar BookForm

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = decode(token);
        if (decoded.rol === "Administrador") {
          setIsAdmin(true);
        } else if (decoded.rol === "Editor") {
          setIsEditor(true);
        } else if (decoded.rol === "Investigador") {
          setIsResearch(true);
        } else if (decoded.rol === "Lector") {
          setIsReader(true);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Función para alternar la visibilidad del formulario
  const toggleBookForm = () => {
    setShowBookForm((prev) => !prev);
  };

  return (
    <div className="bg-white shadow-lg border-[#E5E7EB] dark:bg-[#111827] text-[#1E3A8A] flex flex-col items-center py-8 space-y-4">
      {/* Logo en el centro */}
      <div>
        <Image
          src="/images/editorial-ug.png"
          alt="Logo editorial GTO"
          width={150}
          height={150}
        />
      </div>

      {/* Enlaces específicos para cada tipo de usuario */}
      <div className="flex flex-col items-center space-y-2">
        <Link href="/" className="hover:text-[#FFD700] font-bold">
          Inicio
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/admin/users"
              className="hover:text-[#FFD700] font-bold"
            >
              Gestionar Usuarios
            </Link>
            <Link
              href="/admin/books"
              className="hover:text-[#FFD700] font-bold"
            >
              Gestionar Libros
            </Link>
            <Link
              href="/admin/reports"
              className="hover:text-[#FFD700] font-bold"
            >
              Reporte 1
            </Link>
            <Link
              href="/admin/reports2"
              className="hover:text-[#FFD700] font-bold"
            >
              Reporte 2
            </Link>
          </>
        )}
        {isEditor && (
          <>
            <Link
              href="/editor/books"
              className="hover:text-[#FFD700] font-bold"
            >
              Modificar Libros
            </Link>
            <Link
              href="/editor/reports"
              className="hover:text-[#FFD700] font-bold"
            >
              Descargar Reportes
            </Link>
          </>
        )}

        {/* Botón para mostrar/ocultar el formulario */}
        <button
          onClick={toggleBookForm}
          className="hover:text-orange font-bold"
        >
          {showBookForm
            ? "Ocultar Formulario"
            : "Formulario de Registro de Libros"}
        </button>

        {/* Renderizar el componente BookForm solo si showBookForm es true */}
        {showBookForm && (
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-lg font-bold text-gold">
              Formulario de Libros
            </h2>
            <BookForm />
          </div>
        )}

        <Link href="/dashboard" className="hover:text-[#FFD700] font-bold">
          Volver al Dashboard
        </Link>

        {/* Botón para cerrar sesión */}
        <button onClick={handleLogout} className="hover:text-red-700 font-bold">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default WorkBar;
