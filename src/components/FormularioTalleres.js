"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function FormularioTalleres({ onClose }) {
  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            Inscripción a Talleres
          </h2>
          <p className="mb-6 text-gray-700">
            Por ahora no hay talleres disponibles para inscripción.
            <br />
            Estamos trabajando en el panel de administración para habilitar esta
            funcionalidad próximamente.
          </p>
          <button
            onClick={onClose}
            className="bg-blue hover:bg-gold text-white font-semibold py-2 px-6 rounded transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
