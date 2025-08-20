// Footer.js
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

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

          {/* Logo al centro */}
          <div className="flex-shrink-0 mb-6 md:mb-0 md:order-2 flex justify-center">
            <Link
              href="https://www.ugto.mx/editorial/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <Image
                src="/images/editorial-ug.png"
                alt="Editorial UG Logo"
                width={220}
                height={70}
                className="h-16 w-auto" // 👈 más grande, sin redondeo, sin fondo
              />
            </Link>
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

        {/* Información adicional centrada al final */}
        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-gray-400 text-sm md:text-base">
          <p>
            &copy; 2024 Archivo Histórico Editorial UG | Todos los derechos
            reservados. || Diseño de Rodrigo Iván Ordoñez Chávez
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
