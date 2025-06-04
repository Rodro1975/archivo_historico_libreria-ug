import React from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

const ModalCorreo = ({ email, webmailUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  const copiarCorreo = () => {
    navigator.clipboard.writeText(email);
    toast.success("Correo copiado al portapapeles", {
      style: {
        background: "#facc15", // amarillo
        color: "#1e3a8a", // azul oscuro
        fontWeight: "bold",
      },
      iconTheme: {
        primary: "#1e3a8a",
        secondary: "#facc15",
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-yellow-400 w-96 max-w-full p-6 relative animate-fade-in">
        {/* Encabezado con logos */}
        <div className="flex justify-between items-center mb-4">
          <Image
            src="/images/escudo-horizontal-png.png"
            alt="Logo UG"
            width={80}
            height={40}
            className="object-contain"
          />
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Editorial"
            width={80}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-extrabold text-orange text-center mb-4 border-b border-gray-200 pb-2">
          Correo institucional
        </h2>

        {/* Correo */}
        <p className="text-center text-gray-800 text-sm mb-4 break-all bg-yellow-50 rounded-md p-2 border border-yellow-300">
          {email}
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={copiarCorreo}
            className="w-full px-4 py-2 bg-blue text-white font-semibold rounded-lg hover:bg-gold hover:text-blue transition"
          >
            Copiar correo
          </button>

          <a
            href={webmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold text-center rounded-lg hover:bg-green-700 transition"
          >
            Abrir bandeja de entrada
          </a>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCorreo;
