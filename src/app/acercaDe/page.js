// app/acerca/page.js
"use client";

import Head from "next/head";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FaEnvelope as Email } from "react-icons/fa";
import ModalVentas from "@/components/ModalVentas";

export default function AcercaPage() {
  return (
    <>
      <Head>
        <title>Acerca del Archivo Histórico - Editorial UG</title>
      </Head>

      {/* NavBar sticky (fuera de wrappers con overflow) */}
      <NavBar />

      {/* Contenido */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Hero */}
        <section
          className="relative flex items-center justify-center min-h-[50vh] bg-blue text-center px-4"
          style={{
            backgroundImage: "url('/images/libreriaUg.jpg')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <h1 className="relative text-white font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Acerca del Catálogo Histórico de Publicaciones{" "}
          </h1>
        </section>

        {/* Misión y Visión */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-screen-xl mx-auto grid gap-8 lg:grid-cols-2">
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-blue mb-4">
                Nuestra Misión
              </h2>
              <p className="text-gray-700">
                El Catálogo Histórico de Publicaciones de Editorial UG de la
                Universidad de Guanajuato o Archivo Institucional de
                Publicaciones tiene como objetivo clasificar, preservar y
                difundir todas las publicaciones universitarias, es decir, los
                libros y revistas con sello editorial UG, realizados a lo largo
                de su amplia tradición editorial.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-blue mb-4">
                Nuestros Fondos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Está conformado por un archivo electrónico de las publicaciones
                universitarias y sus metadatos, y un archivo físico de las
                publicaciones en soporte impreso. El Programa Editorial
                Universitario (Editorial UG) es el responsable de administrar y
                promover la integración de títulos, como parte de su compromiso
                con la historia editorial de la institución.
              </p>

              <p className="text-gray-700 leading-relaxed mt-4 sm:mt-5">
                El espacio físico que alberga el acervo impreso de publicaciones
                de este Catálogo se nombró en 2017:
                <strong>
                  {" "}
                  Claustro Académico “Fondo Editorial Eugenio Trueba Olivares”
                </strong>
                , en honor a uno de los principales promotores de la tradición
                editorial universitaria. Se encuentra ubicado en la ciudad de
                Guanajuato, dentro del Mesón de San Antonio, en las oficinas de
                la Editorial UG.
              </p>

              <p className="text-gray-700 leading-relaxed mt-4 sm:mt-5">
                En esta página encontrarás un listado en permanente crecimiento
                de los títulos que conforman la historia editorial de la
                Universidad de Guanajuato.
              </p>
            </div>
          </div>
        </section>

        {/* contacto */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-yellow mb-4">
              Contacto
            </h2>
            <p className="text-gray-300 mb-6">
              Mtro. Edgar Magaña Guzmán Responsable del Catálogo Editorial
            </p>
            <Link
              href="mailto:libreriaug@ugto.mx"
              target="_blank"
              className="inline-flex items-center bg-yellow text-blue font-medium py-2 px-6 rounded-full shadow hover:bg-orange transition"
            >
              <Email className="w-5 h-5 mr-2" />
              libreriaug@ugto.mx
            </Link>
          </div>
        </section>

        {/* Modal de Ventas (nuevo) */}
        <ModalVentas />

        <Footer />
      </div>
    </>
  );
}
