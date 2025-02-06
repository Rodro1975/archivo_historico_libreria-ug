import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const ModalGalery = ({ onClose, libro }) => {
  if (!libro) return null;

  return (
    <section className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg w-full max-w-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto relative 
                      h-[90vh] max-h-[90vh] flex flex-col">
        
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-blue hover:text-red-500 transition-colors"
          aria-label="Cerrar"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>

        {/* Contenido scrollable */}
        <div className="p-4 flex-1 overflow-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-orange text-center">
            {libro.titulo}
          </h1>

          <div className="flex justify-center py-4">
            <Image
              src={libro.portada || "/default-image.jpg"}
              alt={libro.titulo || "Imagen del libro"}
              className="rounded-lg shadow-md w-full max-w-[240px] sm:max-w-[300px] md:max-w-[350px]"
              width={350}
              height={450}
              priority
            />
          </div>

          <p className="text-gray-900 text-sm sm:text-base text-center px-2">
            ¿Quieres leer un fragmento del libro? Regístrate con tu cuenta de
            Google o LinkedIn.
          </p>
        </div>

        {/* Botón de login corregido */}
        <div className="p-4">
          <Link
            href="/login"
            className="mt-2 inline-block px-4 py-2 bg-orange text-white rounded-full hover:bg-green-600 transition duration-200 w-full text-center"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ModalGalery;




