"use client";

import { useState } from "react";
import {
  FaBible,
  FaBook,
  FaPlaceOfWorship,
  FaTable,
  FaTablet,
  FaTasks,
  FaTripadvisor,
} from "react-icons/fa";
import FormularioPrestamoLibro from "@/components/FormularioPrestamoLibro";
import FormularioLibroDigital from "./FormularioLibroDigital";
import FormularioDonacion from "./FormularioDonacion";
import FormularioBd from "./FormularioBd";
import FormularioVisitaGuiada from "./FormularioVisitaGuiada";
import FormularioEspacioTrabajo from "./FormularioEspacioTrabajo";
import FormularioTalleres from "./FormularioTalleres";
import EditorialLogo from "./EditorialLogo";

const ModalSolicitudes = ({ open, onClose, lector }) => {
  const [activeForm, setActiveForm] = useState(null); // Estado unificado

  if (!open) return null;

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

        {/* Renderizado condicional de formularios */}
        {activeForm === null ? (
          <>
            <h2 className="text-2xl font-bold text-blue mb-4 text-center">
              ¿Necesitas ayuda? ¡llena tu solicitud!
            </h2>

            {/* Logo centrado debajo del título (fuera del grid) */}
            <div className="flex justify-center mb-6">
              <EditorialLogo
                className="shrink-0"
                imageClassName="h-10 md:h-12 w-auto" // ~20% más chico
                priority
              />
            </div>

            {/* Grid de opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Botón Préstamo */}
              <button
                onClick={() => setActiveForm("prestamo")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaBook className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud de préstamo de un Libro
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Lectura Digital */}
              <button
                onClick={() => setActiveForm("digital")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaTablet className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud para Lectura digital
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Donación de libros */}
              <button
                onClick={() => setActiveForm("donacion")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaBible className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Donación de libros
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Solicitud BD */}
              <button
                onClick={() => setActiveForm("bd")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaTasks className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud de Autores o libros en la base de datos
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Visita guiada */}
              <button
                onClick={() => setActiveForm("visita")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaTripadvisor className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud para una visita guiada
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Espacio de Trabajo */}
              <button
                onClick={() => setActiveForm("espacio_trabajo")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaTable className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud para un espacio de trabajo
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>

              {/* Botón Talleres */}
              <button
                onClick={() => setActiveForm("talleres")}
                className="group relative overflow-hidden rounded-xl bg-blue p-6 transition-all hover:shadow-lg hover:scale-105 w-full"
              >
                <div className="flex flex-col items-center gap-4">
                  <FaPlaceOfWorship className="text-gold text-xl" />
                  <span className="text-white font-medium">
                    Solicitud de inscripción a talleres
                  </span>
                </div>
                <div className="absolute inset-0 bg-blue/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </button>
            </div>

            {/* Botón de cerrar alternativo */}
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-yellow hover:bg-orange text-blue font-semibold rounded-lg"
            >
              Cerrar
            </button>
          </>
        ) : activeForm === "prestamo" ? (
          <FormularioPrestamoLibro
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "digital" ? (
          <FormularioLibroDigital
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "donacion" ? (
          <FormularioDonacion
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "bd" ? (
          <FormularioBd
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "visita" ? (
          <FormularioVisitaGuiada
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "espacio_trabajo" ? (
          <FormularioEspacioTrabajo
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : activeForm === "talleres" ? (
          <FormularioTalleres
            lectorId={lector?.id}
            onClose={() => setActiveForm(null)}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ModalSolicitudes;
