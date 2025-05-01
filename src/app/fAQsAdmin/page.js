"use client";
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

const FAQsAdmin = () => {
  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-20 mb-20 mr-10 ml-10">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Preguntas Frecuentes - Admin
        </h1>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Información para Administradores
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo gestionar usuarios?
        </h2>
        <p className="text-gray-700 mb-4">
          Puedes acceder a la sección de usuarios y modificar permisos de los
          usuarios existentes.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo revisar registros?
        </h2>
        <p className="text-gray-700 mb-4">
          La sección de reportes te permitirá ver el historial de ediciones
          realizadas por otros usuarios.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo asignar roles a los usuarios?
        </h2>
        <p className="text-gray-700 mb-4">
          En la gestión de usuarios puedes cambiar el rol de cada usuario según
          las necesidades.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Consultas
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo puedo recibir ayuda si tengo problemas con la plataforma?
        </h2>
        <p className="text-gray-700 mb-4">
          Puedes contactar al soporte técnico a través de la sección de ayuda en
          el panel de administración.
        </p>
        <p>
          <Link
            href="/dashboard"
            className="text-2xl font-light text-center text-gold mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            Regresar al Dashboard
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default FAQsAdmin;
