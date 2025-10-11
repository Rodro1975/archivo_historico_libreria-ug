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

      {/* Hero — contenido sobre foto, sin tarjetas */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[92vh] px-4 text-center bg-fixed bg-cover bg-center"
        style={{ backgroundImage: "url('/images/heroLib.jpeg')" }} // fondo fotográfico
      >
        {/* Viñeta y tinte para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/75" />
        <div className="absolute inset-0 mix-blend-multiply bg-[radial-gradient(ellipse_at_center,rgba(242,193,46,0.22)_0%,rgba(242,193,46,0.12)_48%,transparent_80%)]" />

        {/* Escudo UG con luz blanca sutil detrás */}
        <div className="relative z-10">
          <span className="relative inline-block mb-4 mt-12 sm:mb-6">
            {/* Halo blanco (detrás del logo) */}
            <span
              className="pointer-events-none absolute inset-0 -m-3 rounded-full opacity-80 blur-[16px] md:blur-[22px] mix-blend-screen"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(30,58,138,0.90) 0%, rgba(30,58,138,0.45) 38%, rgba(30,58,138,0.00) 72%)",
              }}
            />

            <Image
              src="/images/escudo-png.png"
              alt="Escudo Universidad de Guanajuato"
              width={180}
              height={180}
              className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 relative"
              priority
            />
          </span>
        </div>

        {/* Texto y CTAs sueltos sobre la foto */}
        <div className="relative z-10 w-full max-w-4xl px-2 sm:px-6">
          <h1
            className="text-white font-extrabold tracking-tight [text-wrap:balance]
                 text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-3 sm:mb-4"
            style={{
              textShadow:
                "0 1px 0 rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.45), -1px -1px 0 rgba(0,0,0,0.35), 1px 1px 0 rgba(0,0,0,0.35)",
            }}
          >
            Catálogo <span className="text-[#F2C12E]">Editorial</span> de
            Publicaciones
          </h1>

          <p
            className="mx-auto max-w-2xl text-white/90 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-7"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
          >
            Explora obras, autores y décadas que han marcado la historia
            editorial de la UG. Búsqueda avanzada, fichas detalladas y
            colecciones curadas.
          </p>

          {/* CTAs: principal + secundario */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full
                   bg-[#1E3A8A] text-[#F2C12E] font-semibold
                   px-6 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.35)]
                   transition-transform hover:scale-[1.02]
                   hover:bg-[#F2C12E] hover:text-[#1E3A8A]"
            >
              Inicia sesión y consulta
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full
                   border border-white/30 text-white/90 px-6 py-3
                   hover:bg-white/10 transition-colors"
            >
              Ver catálogo público
            </Link>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <section className="collections-highlighted py-8">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
          Conoce nuestras publicaciones y su historia
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
