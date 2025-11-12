// Footer.js
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import EditorialLogo from "./EditorialLogo";
// Componente Footer
const Footer = () => {
  return (
    <footer
      className="mt-auto relative h-auto bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/footer.jpg')" }}
    >
      {/* Cubierta con degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-200 opacity-90"></div>

      <div className="relative z-5 px-4 py-16 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          {/* Enlaces a la izquierda */}
          <div className="text-center md:text-left md:order-1 flex-grow md:flex-none">
            <ul className="space-y-2 text-blue text-lg">
              <li>
                <Link
                  href="https://www.ugto.mx/editorial/images/aviso-privacidad-programa-editorial.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition duration-300"
                >
                  Aviso de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/contribuciones"
                  className="hover:text-white transition duration-300"
                >
                  Contribuciones
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-shrink-0 mb-6 md:mb-0 md:order-2 flex flex-col items-center gap-3 md:flex-row md:gap-6 justify-center">
            <a
              href="https://www.ugto.mx/"
              target="_blank"
              rel="noopener noreferrer"
              title="Universidad de Guanajuato"
              className="group inline-flex items-center"
            >
              <span className="sr-only">Universidad de Guanajuato</span>
              <div
                className="inline-flex items-center justify-center rounded-2xl
                    bg-white px-3 py-2 shadow-md ring-1 ring-black/10"
              >
                <Image
                  src="/images/escudo-png.png"
                  alt="Escudo de la Universidad de Guanajuato"
                  width={180}
                  height={180}
                  className="h-14 sm:h-16 md:h-20 w-auto"
                />
              </div>
            </a>

            <EditorialLogo />
          </div>

          {/* Redes sociales */}
          <div className="flex space-x-6 md:order-3">
            {/* Facebook */}
            <Link
              href="https://www.facebook.com/EditorialUGTO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A263D] hover:text-[#1877F2] transition-transform transform hover:scale-125 duration-300"
            >
              <FaFacebookF size={30} />
            </Link>

            {/* Instagram */}
            <Link
              href="https://www.instagram.com/editorial_ug?igsh=MTFkZm9xdTVqeGppMw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A263D] hover:text-[#E4405F] transition-transform transform hover:scale-125 duration-300"
            >
              <FaInstagram size={30} />
            </Link>
          </div>
        </div>
        <p className="pt-6 text-center text-gray-400 font-bold text-base md:text-lg">
          Tu dirección de correo electrónico es 100% segura para nosotros.
        </p>

        {/* Información adicional centrada al final */}
        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-gray-400 text-sm md:text-base">
          <p>
            &copy; 2024 Catálogo Histórico Editorial UG | Todos los derechos
            reservados || Desarrollo de Rodrigo Iván Ordoñez Chávez.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
