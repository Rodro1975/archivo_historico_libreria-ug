// app/acerca/page.js
"use client";

import Head from "next/head";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { FaEnvelope as Email } from "react-icons/fa";

export default function AcercaPage() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Head>
        <title>Acerca del Archivo Histórico - Editorial UG</title>
      </Head>

      {/* NavBar */}

      <NavBar />

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
          Acerca del Archivo Histórico
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
              El Archivo Histórico de la Editorial de la Universidad de
              Guanajuato es una institución dedicada a la conservación y
              difusión del patrimonio documental universitario, preservando la
              memoria institucional y facilitando el acceso a la historia de
              nuestra casa de estudios.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-blue mb-4">
              Nuestros Fondos
            </h2>
            <p className="text-gray-700">
              A través de sus fondos documentales, el archivo ofrece una visión
              integral del desarrollo académico, cultural y social de la
              universidad, promoviendo investigación y actividades de difusión
              para toda la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* Coordinación */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-yellow mb-4">
            Coordinación
          </h2>
          <p className="text-gray-300 mb-6">
            La coordinación del Archivo Histórico está a cargo de la Doctora
            Elba Rolón, quien lidera un equipo comprometido con la preservación
            del patrimonio documental.
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

      {/* CTA a Sitio Web */}
      <section className="py-16 px-4 bg-gray-50 text-center">
        <Link
          href="https://www.ugto.mx/editorial/"
          target="_blank"
          className="inline-block bg-orange text-blue font-semibold py-3 px-8 sm:py-4 sm:px-10 md:py-5 md:px-12 rounded-full shadow hover:bg-yellow transition"
        >
          Visita Editorial UG
        </Link>
      </section>

      <Footer />
    </div>
  );
}
