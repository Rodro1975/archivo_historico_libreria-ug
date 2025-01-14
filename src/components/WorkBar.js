import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { decode } from "jsonwebtoken";
import BookForm from "./BookForm";
import UserForm from "./UserForm";

const WorkBar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'book' | 'user' | null

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = decode(token);
        if (decoded.rol === "Administrador") {
          setIsAdmin(true);
        } else if (decoded.rol === "Editor") {
          setIsEditor(true);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const toggleForm = (formType) => {
    setActiveForm((prev) => (prev === formType ? null : formType));
  };

  return (
    <div className="bg-white shadow-lg border-[#E5E7EB] dark:bg-[#111827] text-[#1E3A8A] flex flex-col items-center py-8 space-y-4">
      <div>
        <Image
          src="/images/editorial-ug.png"
          alt="Logo editorial GTO"
          width={150}
          height={150}
        />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <Link href="/" className="hover:text-yellow font-bold">
          Inicio
        </Link>
        {isAdmin && (
          <>
            <Link href="/admin/users" className="hover:text-yellow font-bold">
              Gestionar Usuarios
            </Link>
            <Link
              href="/admin/books"
              className="hover:text-[#FFD700] font-bold"
            >
              Gestionar Libros
            </Link>
            <Link href="/admin/reports" className="hover:text-yellow font-bold">
              Reporte 1
            </Link>
            <Link
              href="/admin/reports2"
              className="hover:text-yellow font-bold"
            >
              Reporte 2
            </Link>
          </>
        )}
        {isEditor && (
          <>
            <Link href="/editor/books" className="hover:text-yellow font-bold">
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
        <button
          onClick={() => toggleForm("user")}
          className="hover:text-orange font-bold"
        >
          {activeForm === "user"
            ? "Ocultar Formulario de Usuarios"
            : "Formulario de Registro de Usuarios"}
        </button>
        <button
          onClick={() => toggleForm("book")}
          className="hover:text-orange font-bold"
        >
          {activeForm === "book"
            ? "Ocultar Formulario de Libros"
            : "Formulario de Registro de Libros"}
        </button>
        {activeForm === "book" && (
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-lg font-bold text-gold">
              Formulario de Libros
            </h2>
            <BookForm />
          </div>
        )}
        {activeForm === "user" && (
          <div className="flex flex-col items-center mt-4">
            <h2 className="text-lg font-bold text-gold">
              Formulario de Usuarios
            </h2>
            <UserForm />
          </div>
        )}
        <Link href="/dashboard" className="hover:text-yellow font-bold">
          Volver al Dashboard
        </Link>
        <button onClick={handleLogout} className="hover:text-red-700 font-bold">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default WorkBar;
