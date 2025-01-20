import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ModalGalery = ({ isOpen, onClose, libro }) => {
  if (!isOpen || !libro) return null;

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg max-w-2xl mx-4 relative">
        {/* Botón de cerrar con ícono de Font Awesome */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-blue hover:text-red-500"
          aria-label="Cerrar"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" /> {/* Ícono de cerrar */}
        </button>

        <div className="p-4">
          <h1 className="text-3xl font-extrabold text-orange text-center">
            {libro.titulo}
          </h1>
        </div>
        <div className="flex justify-center pb-4">
          <Image
            src={libro.portada || "/default-image.jpg"} // Imagen predeterminada en caso de que no haya URL
            alt={libro.titulo}
            className="rounded-lg shadow-md"
            width={240}
            height={320}
            priority
          />
        </div>
        <div className="px-4 pb-4 text-center">
          <p className="text-gray-900">
            ¿Quieres leer un fragmento del libro? Regístrate con tu cuenta de
            Google o LinkedIn.
          </p>
          <Link 
  href="/login" // Enlace a la página de login
  className="mt-2 inline-block px-4 py-2 bg-orange text-white rounded-full hover:bg-green-600 hover:text-white transition duration-200"
>
  Iniciar sesión
</Link>
        </div>
      </div>
    </section>
  );
};

export default ModalGalery;
