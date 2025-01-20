"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

const FAQsPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 mb-8">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Preguntas Frecuentes
        </h1>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Información General
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Qué es el Archivo Histórico de la Universidad de Guanajuato?
        </h2>
        <p className="text-gray-700 mb-4">
          El Archivo Histórico de la Universidad de Guanajuato es una colección
          de documentos y registros importantes que preservan la historia
          académica y administrativa de la institución.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Qué tipos de documentos se encuentran en el archivo?
        </h2>
        <p className="text-gray-700 mb-4">
          El archivo contiene documentos históricos, fotos, mapas, registros
          académicos antiguos, y otros materiales relacionados con la historia
          de la Librería de la universidad.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Acceso y Uso del Archivo
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo puedo acceder al archivo histórico?
        </h2>
        <p className="text-gray-700 mb-4">
          El archivo es accesible tanto en línea como en forma física. Para
          acceder a la versión digital, puede visitar nuestra plataforma en
          línea, mientras que para consultas físicas se requiere programar una
          visita.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Es necesario registrarse para consultar los documentos?
        </h2>
        <p className="text-gray-700 mb-4">
          Para consultas en línea, es necesario registrarse en el sistema de la
          universidad. Las visitas físicas pueden requerir una autorización
          previa.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Políticas de Uso
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Se pueden descargar los documentos del archivo?
        </h2>
        <p className="text-gray-700 mb-4">
          Algunos documentos están disponibles para descarga en formato digital,
          pero otros solo pueden consultarse en línea debido a restricciones de
          conservación.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Puedo solicitar una copia física de algún documento?
        </h2>
        <p className="text-gray-700 mb-4">
          Es posible solicitar copias físicas de ciertos documentos siguiendo
          los lineamientos establecidos por el archivo. Se debe presentar una
          solicitud formal.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Colaboración y Donaciones
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Puedo donar documentos históricos al archivo?
        </h2>
        <p className="text-gray-700 mb-4">
          Sí, el archivo acepta donaciones de documentos históricos que
          contribuyan a la preservación del patrimonio de la universidad. Para
          más detalles, por favor contacta a la administración del archivo.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Cómo puedo colaborar en la digitalización o preservación de
          documentos?
        </h2>
        <p className="text-gray-700 mb-4">
          Existen programas para colaborar en la preservación de documentos
          históricos. Los interesados pueden postularse para ser voluntarios o
          colaboradores en los proyectos de digitalización.
        </p>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Consultas y Asistencia
        </h2>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿A quién puedo contactar si tengo preguntas específicas sobre un
          documento?
        </h2>
        <p className="text-gray-700 mb-4">
          Puedes contactar al equipo del archivo a través del correo electrónico{" "}
          <Link href="mailto:archivo@ugto.mx" className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100">
  archivo@ugto.mx
</Link>{" "}
          o al número telefónico (473) 732 0006.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          ¿Qué debo hacer si no encuentro el documento que estoy buscando?
        </h2>
        <p className="text-gray-700 mb-4">
          Si no encuentras el documento que estás buscando, puedes enviar una
          solicitud de asistencia al equipo del archivo, quienes te guiarán en
          la búsqueda o en la solicitud de un documento específico.
        </p>
        <p>
        <Link href="/" className="text-2xl font-light text-center text-gold mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100">
  Regresar al inicio
</Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default FAQsPage;
