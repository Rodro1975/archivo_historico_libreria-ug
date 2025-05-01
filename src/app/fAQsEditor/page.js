"use client";
import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

const FAQsEditor = () => {
  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Preguntas Frecuentes - Editor
        </h1>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Información para Editores
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo subir un nuevo libro?
        </h2>
        <p className="text-gray-700 mb-4">
          En la sección Catálogo puedes agregar nuevos libros proporcionando los
          detalles necesarios.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo editar la información de un libro?
        </h2>
        <p className="text-gray-700 mb-4">
          Cada libro tiene un botón de edición que permite modificar los
          detalles del libro como título, autor y descripción.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo contactar con soporte?
        </h2>
        <p className="text-gray-700 mb-4">
          Si encuentras algún problema, puedes contactar con el soporte a través
          de la sección de ayuda en el menú.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Consultas y Ayuda
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Qué hacer si un libro tiene errores en la información?
        </h2>
        <p className="text-gray-700 mb-4">
          Si encuentras errores en la información de un libro, puedes editarlo o
          contactar a un administrador para que te ayude.
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

export default FAQsEditor;
