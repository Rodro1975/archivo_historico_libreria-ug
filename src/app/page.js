// app/page.js
"use client";

import Head from "next/head";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ModalVentas from "@/components/ModalVentas";

import Image from "next/image";
import Link from "next/link";
import Modal from "../components/Modal";
import { useEffect, useState, useCallback } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 2000);

    const handleScroll = () => {
      setIsModalOpen(false);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>Página Principal - Archivo Histórico Editorial UG</title>
      </Head>
      {/* Barra de navegación */}
      <NavBar />

      {/* Hero*/}
      <section
        className="
    relative flex flex-col justify-center items-center
    min-h-[90vh] px-4
    bg-fixed bg-cover bg-center text-center
  "
        style={{ backgroundImage: "url('/images/guanajuato.jpg')" }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        {/* Escudo */}
        <div className="relative z-10">
          <Image
            src="/images/escudo-png.png"
            alt="Escudo UG"
            width={180}
            height={180}
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 mb-4 mt-12 sm:mb-6"
          />
        </div>

        {/* Contenedor de texto y botón */}
        <div className="relative z-10 max-w-2xl">
          <h1
            className="text-gold font-extrabold drop-shadow-lg
      text-3xl sm:text-4xl md:text-6xl
      leading-tight mb-2 sm:mb-4"
          >
            Archivo Histórico de la Editorial UG
          </h1>
          <p
            className="text-gold
      text-sm sm:text-base md:text-lg
      mb-4 sm:mb-6"
          >
            Explora nuestra colección y aprende más sobre la historia de la
            Editorial de la UG.
          </p>
          <Link
            href="/login"
            className="inline-block bg-yellow text-blue font-semibold
        py-2 px-6 sm:py-3 sm:px-10 md:py-4 md:px-12
        rounded-full transition duration-300
        hover:bg-blue hover:text-yellow
      "
          >
            Inicia Sesión
          </Link>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section className="collections-highlighted py-8">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
          Colecciones Destacadas
        </h2>
        <div className="mx-4 md:mx-20 lg:mx-40">
          {" "}
          {/* Aquí agregamos los márgenes responsivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="collection-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/libroUg.jpg"
                alt="Título de la Colección"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl text-gray-300 font-semibold mt-2">
                Colección: Cultura y Tradiciones
              </h3>
              <p className="text-gray-600">
                Breve descripción sobre la colección destacada.
              </p>
              <button className="mt-4 bg-blue text-white py-2 px-4 rounded-full">
                Explorar
              </button>
            </div>
            <div className="collection-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/libroUg.jpg"
                alt="Título de la Colección"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl text-gray-300 font-semibold mt-2">
                Colección: Arte y Literatura
              </h3>
              <p className="text-gray-600">
                Breve descripción sobre la colección destacada.
              </p>
              <button className="mt-4 bg-blue text-white py-2 px-4 rounded-full">
                Explorar
              </button>
            </div>
            <div className="collection-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/libroUg.jpg"
                alt="Título de la Colección"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl text-gray-300 font-semibold mt-2">
                Colección: Ciencia y Tecnología
              </h3>
              <p className="text-gray-600">
                Breve descripción sobre la colección destacada.
              </p>
              <button className="mt-4 bg-blue text-white py-2 px-4 rounded-full">
                Explorar
              </button>
            </div>
            {/* Repetir para otras colecciones */}
          </div>
        </div>
      </section>
      {/* Modal de Ventas (nuevo) */}
      <ModalVentas />
      {/* Catálogo destacado (glassy card) */}
      <section className="relative py-12">
        <div className="mx-4 md:mx-20 lg:mx-40">
          <Link
            href="/catalogo"
            aria-label="Ir al Catálogo Histórico"
            className="group block relative overflow-hidden rounded-2xl"
          >
            {/* Fondo con la misma imagen */}
            <Image
              src="/images/ugtoUG.jpeg"
              alt="Catálogo Histórico Editorial UG"
              width={1600}
              height={900}
              priority
              className="w-full h-[360px] md:h-[420px] lg:h-[460px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />

            {/* Overlay degradado sutil para contraste */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/30 to-black/10" />

            {/* Panel glassy */}
            <div
              className="
          absolute inset-x-4 md:inset-x-10 bottom-6 md:bottom-8
          backdrop-blur-md bg-white/10 border border-white/20
          rounded-2xl shadow-xl
          px-5 py-5 md:px-8 md:py-6
          ring-1 ring-white/10
        "
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-sm">
                    Explora el{" "}
                    <span className="text-gold">Catálogo Histórico</span>
                  </h2>
                  <p className="mt-1 text-gray-100/90 md:max-w-2xl">
                    Consulta títulos, autores, años y más. Acceso para lectores
                    autenticados y búsqueda pública de metadatos.
                  </p>
                </div>

                {/* Botón tipo tarjeta (CTA) */}
                <div
                  className="
              w-full md:w-auto
              rounded-xl bg-white/15 border border-white/25
              px-5 py-3 text-center
              transition-all duration-300
              hover:bg-white/25 hover:shadow-2xl
              group-hover:translate-y-[-1px]
              ring-1 ring-white/10
            "
                >
                  <span className="block font-semibold text-white">
                    Ir al Catálogo
                  </span>
                  <span
                    className="
                block text-xs mt-0.5
                bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent
              "
                  >
                    /catalogo
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
