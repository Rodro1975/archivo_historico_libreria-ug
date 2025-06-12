"use client";

import React, { useState } from "react"; // Asegúrate de importar useState
import Image from "next/image";
import Link from "next/link";
import {
  FaEnvelope as Email,
  FaQuestionCircle as Question,
  FaChevronDown as Chevron,
  FaBook,
  FaStore,
  FaFileAlt,
  FaGraduationCap,
  FaClock,
  FaPhone,
  FaBuilding,
  FaLink,
} from "react-icons/fa";

const enlacesOficiales = [
  {
    href: "https://www.ugto.mx/editorial/",
    label: "Editorial UG",
    icon: <FaBook className="inline mr-2" />,
  },
  {
    href: "https://libreriaug.ugto.mx/",
    label: "Librería UG",
    icon: <FaStore className="inline mr-2" />,
  },
  {
    href: "https://www.ugto.mx/directorio-universidad-guanajuato/secretaria-academica-ug/programa-editorial-universitario",
    label: "Programa Editorial Universitario",
    icon: <FaFileAlt className="inline mr-2" />,
  },
  {
    href: "https://www.ugto.mx/index.php",
    label: "Universidad de Guanajuato",
    icon: <FaGraduationCap className="inline mr-2" />,
  },
];

const ModalInformacion = ({ open, onClose }) => {
  const [openIndex, setOpenIndex] = useState(null); // Añadir este estado

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

        <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
          ¿Necesitas más información?
        </h2>

        <div className="flex flex-col items-center gap-4">
          <Image
            src="/images/editorial-ug.png"
            alt="Logo Editorial UG"
            width={200}
            height={100}
            className="mb-4"
          />

          {/* Contacto directo */}
          <section className="rounded-xl py-16 px-4 bg-blue">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold text-yellow mb-4">
                Contacto Directo
              </h2>
              <p className="text-gray-300 mb-6">
                La coordinación del Archivo Histórico está a cargo de la Doctora
                Elba Rolón, quien lidera un equipo comprometido con la
                preservación del patrimonio documental.
              </p>
              <Link
                href="mailto:elba.rolon@ugto.mx"
                target="_blank"
                className="inline-flex items-center bg-yellow text-blue font-medium py-2 px-6 rounded-full shadow hover:bg-orange transition"
              >
                <Email className="w-5 h-5 mr-2" />
                elba.rolon@ugto.mx
              </Link>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <div className="mt-12 bg-gray-400 p-6 rounded-xl border border-blue">
            <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2 mb-4">
              <Question className="text-yellow" /> Preguntas Frecuentes (FAQ)
            </h3>

            <div className="space-y-3">
              {[
                {
                  question: "¿Cómo consultar documentos digitales?",
                  answer: (
                    <>
                      Accede a la Biblioteca Digital de la Universidad de
                      Guanajuato (
                      <a
                        href="http://www.bibliotecas.ugto.mx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow font-semibold underline hover:text-blue transition-colors"
                      >
                        http://www.bibliotecas.ugto.mx
                      </a>
                      ) con tu correo institucional. Necesitas credencial de
                      estudiante o empleado para acceso completo.
                    </>
                  ),
                },
                {
                  question: "¿Puedo solicitar visitas al archivo físico?",
                  answer: (
                    <>
                      Sí, las visitas se programan a través del portal de la
                      Editorial UG (
                      <a
                        href="https://www.ugto.mx/editorial/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow font-semibold underline hover:text-blue transition-colors"
                      >
                        https://editorial.ugto.mx/visitas
                      </a>
                      ). Debes registrarte con 15 días de anticipación y
                      presentar identificación oficial.
                    </>
                  ),
                },
                {
                  question:
                    "¿Qué requisitos hay para acceder a material reservado?",
                  answer: (
                    <>
                      El material de acceso restringido requiere aprobación por
                      parte del Comité Editorial. Envía tu solicitud formal al
                      correo{" "}
                      <a
                        href="mailto:editorial@ugto.mx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-yellow font-semibold underline hover:text-blue transition-colors"
                      >
                        editorial@ugto.mx
                      </a>{" "}
                      con una carta de motivos y aval institucional. En la
                      sección de notificaciones en tu panel de lector
                      encontrarás un formulario para ello.
                    </>
                  ),
                },
                {
                  question:
                    "¿Dónde puedo consultar el directorio del Programa Editorial Universitario?",
                  answer: (
                    <>
                      Puedes consultar el directorio completo del Programa
                      Editorial Universitario en la página oficial de la
                      Universidad de Guanajuato:{" "}
                      <a
                        href="https://www.ugto.mx/editorial/directorio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow font-semibold underline hover:text-blue transition-colors"
                      >
                        https://www.ugto.mx/editorial/directorio
                      </a>
                      .
                    </>
                  ),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="border-b border-blue/20 last:border-0"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full py-3 flex justify-between items-center text-blue hover:text-yellow transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Chevron
                        className={`text-yellow transition-transform ${
                          openIndex === index ? "rotate-180" : ""
                        }`}
                      />
                      {item.question}
                    </span>
                  </button>

                  {openIndex === index && (
                    <div className="pb-3 text-gray-200 animate-fadeIn">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces útiles */}
          <div className="w-full text-left space-y-4">
            <h3 className="text-lg font-semibold text-blue flex items-center gap-2">
              <FaLink className="text-orange text-xl" />
              Enlaces oficiales:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {enlacesOficiales.map(({ href, label, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-blue text-yellow px-4 py-3 rounded-lg 
                 font-semibold hover:bg-yellow hover:text-blue transition 
                 w-full h-14" // Altura fija para uniformidad
                >
                  <span className="flex items-center gap-2">
                    {icon}
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Horario y ubicación */}
          <div className="w-full text-left space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-blue flex items-center gap-2">
              <FaBuilding className="text-orange text-xl" />
              Ubicación y Horario
            </h3>

            <div className="bg-blue p-6 rounded-xl border-l-4 border-gold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de contacto */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaStore className="text-orange text-xl mr-3" />
                    </div>
                    <div>
                      <p className="text-gray-200">
                        <strong className="text-gold">Librería UG</strong>
                        <br />
                        C. Pedro Lascurain de Retana 12-8, Calzada de Guadalupe,
                        36000 Guanajuato, Gto.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaPhone className="text-orange text-xl mr-3" />
                    </div>
                    <div>
                      <p className="text-gray-200">
                        <strong className="text-gold">Teléfono:</strong>{" "}
                        <a
                          href="tel:+524737320006"
                          className="text-gray-200 hover:text-orange transition-colors"
                        >
                          +52 473 732 0006
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaClock className="text-orange text-xl mr-3" />
                    </div>
                    <div>
                      <p className="text-gray-200">
                        <strong className="text-gold">Horario:</strong>
                        <br />
                        Lunes a sábado: 8:00 a.m. – 8:00 p.m.
                        <br />
                        Domingo: Cerrado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div className="flex justify-center">
                  <div className="relative w-full rounded-lg overflow-hidden border-4 border-gold shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.3887289035847!2d-101.25354940000004!3d21.017126500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842b75c399a5811b%3A0x3a7325c400d49a14!2sLibrer%C3%ADa%20UG!5e0!3m2!1ses!2smx!4v1749740733258!5m2!1ses!2smx"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    ></iframe>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue text-white text-center py-2">
                      Ver en Google Maps
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de cerrar alternativo */}
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-yellow hover:bg-orange text-blue font-semibold rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInformacion;
