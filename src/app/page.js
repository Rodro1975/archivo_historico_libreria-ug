// app/page.js
"use client";

import Head from "next/head";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Carrusel from "@/components/Carrusel";
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

  const slides = [
    { image: "/images/libroUg.jpg", alt: "Descripción de la imagen 1" },
    { image: "/images/libroUg.jpg", alt: "Descripción de la imagen 2" },
    { image: "/images/libroUg.jpg", alt: "Descripción de la imagen 3" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>Página Principal - Archivo Histórico Editorial UG</title>
      </Head>

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
      {/* Barra de navegación */}
      <NavBar />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <section className="news-events relative py-48 text-center bg-fixed bg-cover bg-center">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
          Noticias y Eventos
        </h2>
        <div className="mx-4 md:mx-20 lg:mx-40">
          {" "}
          {/* Aquí controlas el margen */}
          <Carrusel slides={slides} />
        </div>
      </section>
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
                Colección: Historia Local
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
      {/* Coleccion destacada del mes */}
      <section className="featured-month py-8">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
          Colección Destacada del Mes
        </h2>
        <div className="mx-4 md:mx-20 lg:mx-40">
          <div className="p-6 bg-gray-100 rounded-lg shadow-md mx-auto max-w-3xl">
            <Image
              src="/images/libroUg.jpg"
              alt="Colección Destacada"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 mb-2">
              Este mes, exploramos la colección sobre [Tema de la Colección].
              Esta colección incluye documentos, fotografías y testimonios que
              destacan su importancia histórica.
            </p>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
              Una cita inspiradora o un testimonio relevante sobre la colección.
            </blockquote>
          </div>
        </div>
      </section>
      {/* Coleccion historias personales */}
      <section className="personal-stories py-8">
        <h2 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-yellow to-orange bg-clip-text text-transparent">
          Historias Detrás de las Colecciones
        </h2>
        <div className="mx-4 md:mx-20 lg:mx-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="story-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/juanperez.png"
                alt="Historia Personal"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl font-semibold mt-2">
                El Legado de Juan Pérez
              </h3>
              <p className="text-gray-600">
                Juan Pérez donó su colección de cartas y manuscritos,
                permitiendo a futuras generaciones conocer la historia local
                desde una perspectiva única y personal.
              </p>
            </div>
            <div className="story-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/juanperez.png"
                alt="Historia Personal"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl font-semibold mt-2">
                Voces de la Comunidad
              </h3>
              <p className="text-gray-600">
                Esta colección reúne testimonios de habitantes que compartieron
                sus vivencias durante eventos históricos, enriqueciendo el
                acervo cultural de la región.
              </p>
            </div>
            <div className="story-card bg-white shadow-lg rounded-lg p-4">
              <Image
                src="/images/juanperez.png"
                alt="Historia Personal"
                width={500}
                height={300}
                className="w-full h-40 object-cover rounded-t-lg"
              />
              <h3 className="text-xl font-semibold mt-2">
                Mujeres en la Historia
              </h3>
              <p className="text-gray-600">
                Documentos y fotografías que visibilizan el papel fundamental de
                las mujeres en la construcción de la identidad y memoria
                colectiva.
              </p>
            </div>
          </div>
          {/* Repetir otras historias */}
        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
}
