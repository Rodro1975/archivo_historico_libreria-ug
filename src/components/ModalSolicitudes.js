"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import supabase from "@/lib/supabase";
import {
  FaBible,
  FaBook,
  FaPlaceOfWorship,
  FaTable,
  FaTablet,
  FaTasks,
  FaTripadvisor,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

const ModalSolicitudes = ({ open, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white max-w-2xl w-full p-6 rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-blue mb-4 text-center">
          ¿Necesitas ayuda? ¡llena tu solicitud!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Editorial UG"
            width={200}
            height={100}
            className="mb-4 col-span-full mx-auto"
          />

          {/* Botones para solicitudes */}
          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaBook className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solictud de prestamo de un Libro
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaTablet className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solictud para Lectura digital
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaBible className="text-gold text-xl" />
              <span className="text-white font-medium">Donacion de libros</span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaTasks className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solicitud de Autores o libros en la base de datos
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaTripadvisor className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solictud para una visita guiada
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaTable className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solictud para un espacio de trabajo
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>

          <button className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full">
            <div className="flex flex-col items-center gap-4">
              <FaPlaceOfWorship className="text-gold text-xl" />
              <span className="text-white font-medium">
                Solictud de inscripcion a talleres
              </span>
            </div>
            <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSolicitudes;
