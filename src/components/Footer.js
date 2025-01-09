// Footer.js
"use client"; // Indica que este es un Client Component

import React, { useState } from "react";
import Image from "next/image";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Mandamos el correo ingresado
      });

      if (response.ok) {
        console.log("Correo electrónico suscrito:", email);
        setEmail(""); // Limpiar el campo después de la suscripción
        alert("¡Gracias por suscribirte!");
      } else {
        alert("Error al suscribirte. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al suscribirte. Inténtalo de nuevo.");
    }
  };

  return (
    <footer
      className="mt-auto relative h-auto bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/images/footer.jpg')" }}
    >
      {/* Cubierta con degradado de gris oscuro a gris medio */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-200 opacity-90"></div>

      <div className="relative z-5 px-4 py-12 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Enlaces a la izquierda */}
          <div className="text-center md:text-left md:order-1 flex-grow md:flex-none">
            <ul className="space-y-2 text-blue">
              <li>
                <a
                  href="/avisoPrivacidad" // Cambia el href aquí para que apunte a la página de aviso de privacidad
                  className="hover:text-white transition duration-300"
                >
                  Aviso de privacidad
                </a>
              </li>

              <li>
                <a
                  href="/terminosCondiciones"
                  onClick={() => {
                    /* Lógica para abrir modal de Términos y condiciones */
                  }}
                  className="hover:text-white transition duration-300"
                >
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a
                  href="/faqs"
                  onClick={() => {
                    /* Lógica para abrir modal de FAQs */
                  }}
                  className="hover:text-white transition duration-300"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="https://www.ugto.mx/directorio-universidad-guanajuato/secretaria-academica-ug/programa-editorial-universitario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition duration-300"
                >
                  Programa Editorial Universitario
                </a>
              </li>
              <li>
                <a
                  href="/contribuciones"
                  onClick={() => {
                    /* Lógica para abrir modal de Agradecimientos y contribuciones */
                  }}
                  className="hover:text-white transition duration-300"
                >
                  Contribuciones
                </a>
              </li>
            </ul>
          </div>

          {/* Logo al centro */}
          <div className="flex-shrink-0 mb-6 md:mb-0 md:order-2 md:w-auto w-full flex justify-center">
            <a
              href="https://www.ugto.mx/editorial/"
              target="_blank"
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              <Image
                src="/images/editorial-ug.png"
                alt="Librería Logo"
                width={150}
                height={50}
                className="h-12 w-auto rounded-full"
              />
            </a>
          </div>

          {/* Sección de Suscripción a la derecha */}
          <div className="flex flex-col items-center md:items-end w-full md:w-1/3 space-y-4 md:order-3">
            <h2 className="text-blue text-xl font-bold mb-2 text-center md:text-right">
              Suscripción a boletín de noticias
            </h2>
            <p className="text-gray-200 text-center md:text-right">
              Tu dirección de correo electrónico es 100% segura para nosotros.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col items-center md:items-start w-full max-w-xs space-y-2"
            >
              <input
                type="email"
                placeholder="Escribe tu correo electrónico..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-2 rounded-full border-gray-300 mb-2 w-full text-gray-500"
              />
              <button
                type="submit"
                className="bg-blue text-white py-2 px-4 rounded-full font-bold hover:bg-white hover:text-blue transition duration-300 w-full"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Información adicional centrada al final */}
        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-gray-400">
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
