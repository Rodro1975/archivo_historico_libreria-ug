// components/Modal.js
import React from "react";
import Image from "next/image";

const Modal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Contenedor principal del modal */}
      <div className="relative w-[90%] h-[80%] md:w-[80%] lg:w-[70%]">
        {/* Imagen con texto superpuesto */}
        <div className="relative w-full h-full">
          <Image
            src="/images/iglesia.jpg" // Reemplaza con la ruta de tu imagen
            alt="nodal informativo"
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
            <h1 className="text-blue text-9xl font-bold mb-2">1940</h1>
            <p className="text-lg md:text-2xl lg:text-xl max-w-[90%] md:max-w-[80%]">
              Descubre nuestra colección a través de la historia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;