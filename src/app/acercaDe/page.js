"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from 'next/link';

const AcercaDePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />

      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Acerca del Archivo Histórico de la Editorial de la Universidad de
          Guanajuato
        </h1>

        <p className="text-gray-700 mb-4">
          El Archivo Histórico de la Editorial de la Universidad de Guanajuato
          es una institución dedicada a la conservación y difusión del
          patrimonio documental de la universidad. Su misión es preservar la
          memoria institucional y facilitar el acceso a los documentos que
          narran la historia y evolución de nuestra casa de estudios.
        </p>

        <p className="text-gray-700 mb-4">
          A través de sus fondos documentales, el archivo ofrece una visión
          integral del desarrollo académico, cultural y social de la
          universidad. Además, promueve actividades de investigación y difusión
          que permiten a los estudiantes, académicos y al público en general
          conocer más sobre nuestra rica historia.
        </p>

        <h2 className="text-2xl font-semibold text-[#003c71] mt-6 mb-2">
          Coordinación
        </h2>
        <p className="text-gray-700 mb-4">
          La coordinación del Archivo Histórico está a cargo de la Doctora Elba
          Rolón, quien lidera un equipo comprometido con la preservación y
          difusión del patrimonio documental. Para más información o consultas,
          puedes ponerte en contacto con ella a través del correo electrónico:
          <span className="text-orange"> elba.rolon@ugto.mx</span>.
        </p>

        <h2 className="text-2xl font-semibold text-[#003c71] mt-6 mb-2">
          Visita Nuestro Sitio Web
        </h2>
        <p className="text-gray-700 mb-4">
          Para más detalles sobre nuestras colecciones y actividades, visita
          nuestro sitio web en{" "}
          

<span className="text-orange">
  {" "}
  <Link href="https://www.ugto.mx/editorial/" target="_blank" rel="noopener noreferrer">
    Editorial UG
  </Link>
</span>

          .
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AcercaDePage;
