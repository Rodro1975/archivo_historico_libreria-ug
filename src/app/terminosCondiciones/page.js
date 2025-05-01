"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

const AvisoPrivacidadPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-blue">
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-20 mb-20 mr-10 ml-10">
        <h1 className="text-4xl font-bold text-center text-[#003c71] mb-6">
          Aviso Legal
        </h1>
        <h2 className="text-3xl font-bold text-center text-[#003c71] mb-6">
          Términos y Condiciones Generales de Uso del Archivo Histórico de la
          Editorial de la Universidad de Guanajuato
        </h2>
        <p className="text-gray-700 mb-4">
          La página <strong>www.libreriaug.ugto.mx</strong> es titularidad de la
          Universidad de Guanajuato, con domicilio en Lascurain de Retana 5,
          Colonia Centro, C.P. 36000 en Guanajuato, Gto. México; con número de
          R.F.C. UGU450325KY2 y número de teléfono (473) 732 0006 ext. 2078 y
          correo electrónico de contacto
          <a href="mailto:libreriaug@ugto.mx"> libreriaug@ugto.mx</a>; y la
          misma fue creada con el objeto de albergar el proyecto de librerías
          universitarias de la Universidad de Guanajuato, que son espacios de
          difusión sin fines de lucro para la promoción de las publicaciones
          editoriales generadas por nuestra Casa de Estudios, así como la
          difusión y acrecentamiento de los valores, poniéndolos a disposición
          de la sociedad en general, a través del presente proyecto en medio
          electrónico denominado Librería UG Virtual (en lo sucesivo
          <strong> LIBRERÍA UG VIRTUAL </strong>), el cual es gestionado al
          interior de la Universidad por el Programa Editorial Universitario, y
          cuyas actividades de venta de libros impresos y digitales, facilita la
          interacción de la Universidad de Guanajuato y sus productos
          académicos, con la sociedad en general, potenciando su función social
          con el impulso de acciones culturales que impacten positivamente en la
          comunidad.
        </p>
        <p className="text-gray-700 mb-4">
          La presente página <strong>www.libreriaug.ugto.mx</strong> ha sido
          desarrollada y administrada por
          <strong> NETIZEN DIGITAL SOLUTIONS </strong> con el nombre comercial
          NETIZEN DIGITAL SOLUTIONS, con número de R.F.C. NDS150225SZ1, con
          domicilio en calle Tlacotalpan, nº 13, interior 02-A, Colonia Roma Sur
          Delegación Cuauhtémoc C.P. 06760, Ciudad de México, página web{" "}
          <Link
            href="http://www.hipertexto.com.co"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            www.hipertexto.com.co
          </Link>{" "}
          <span style={{ whiteSpace: "nowrap" }}>
            y co-administrada por parte de la Universidad de Guanajuato,
          </span>
          con domicilio en Lascurain de Retana 5, Colonia Centro, C.P. 36000 en
          Guanajuato, Gto. México; con número de R.F.C. UGU450325KY2 y número de
          teléfono (473) 732 0006 ext. 2078 y correo electrónico de contacto{" "}
          <Link
            href="mailto:libreriaug@ugto.mx"
            className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            libreriaug@ugto.mx
          </Link>
          .
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Definiciones
        </h2>
        <ul className="text-gray-700 mb-4">
          <li>
            <strong>USUARIO:</strong> Toda aquella persona que navega en LA
            PÁGINA.
          </li>
          <li>
            <strong>USUARIO ACTIVO:</strong> Aquel usuario que se ha registrado
            en LA PÁGINA.
          </li>
          <li>
            <strong>SECCIONES:</strong> Se refiere a aquellas partes en las
            cuales está dividida LA PÁGINA, las cuales son visibles para el
            USUARIO.
          </li>
          <li>
            <strong>SERVICIOS:</strong> Se refiere a aquellos servicios
            plasmados en LA PÁGINA que LIBRERÍA UG VIRTUAL publica para que los
            USUARIOS puedan solicitarlos, y que consisten en venta de libros
            impresos y digitales.
          </li>
          <li>
            <strong>CLIENTE:</strong> Al USUARIO ACTIVO que solicita cualquiera
            de nuestros servicios, adquiere automáticamente el título de
            cliente.
          </li>
          <li>
            <strong>ASESOR:</strong> El personal que trabaja para LIBRERÍA UG
            VIRTUAL encargado de brindar cualquier servicio de los ubicados en
            LA PÁGINA.
          </li>
        </ul>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Condiciones Generales de LA PÁGINA
        </h2>
        <p className="text-gray-700 mb-4">
          LA PÁGINA está dedicada al impulso del proyecto LIBRERÍA UG VIRTUAL,
          como un espacio cultural sin fines de lucro para la promoción de las
          expresiones del arte y la cultura, poniéndolos a disposición de la
          sociedad en general, a través de la venta de libros impresos y
          digitales pertenecientes al sello editorial de la Universidad de
          Guanajuato y en coedición con otros sellos editoriales.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Soporte técnico
        </h2>
        <p className="text-gray-700 mb-4">
          LIBRERÍA UG VIRTUAL brindará soporte técnico y apoyo para cualquier
          situación que corresponda al funcionamiento de LA PÁGINA o de
          cualquiera de sus servidores. El soporte se brindará vía correo
          electrónico a{" "}
          <Link
            href="mailto:libreriaug@ugto.mx"
            className="mb-4 text-orange mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            libreriaug@ugto.mx
          </Link>
          , y no se brindará en cuanto al mal funcionamiento de los dispositivos
          que esté usando el USUARIO y/o USUARIO ACTIVO y/o CLIENTE. El soporte
          es según criterio exclusivo de LIBRERÍA UG VIRTUAL, y puede cancelar
          dicho soporte en cualquier momento y sin previo aviso.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Relación de las partes
        </h2>
        <p className="text-gray-700 mb-4">
          Para los fines de los TÉRMINOS, el USUARIO y/o USUARIO ACTIVO y/o
          CLIENTE y LIBRERÍA UG VIRTUAL serán independientes, y actuarán como
          tales sin que en ningún momento lleguen a ser socios, participantes de
          una empresa conjunta, agentes, empleados ni empleadores del otro. El
          USUARIO y/o USUARIO ACTIVO y/o CLIENTE no tienen ninguna autoridad
          para asumir ni crear ninguna obligación para o en nombre de LIBRERÍA
          UG VIRTUAL, explícita o implícita.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          No renuncia de derechos por parte de LIBRERÍA UG VIRTUAL.
        </h2>
        <p className="text-gray-700 mb-4">
          Si LIBRERÍA UG VIRTUAL no ejerce o hace cumplir algún derecho o
          disposición de los TÉRMINOS, esto no significa que está renunciando a
          dicho derecho o disposición.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Propiedad intelectual
        </h2>
        <p className="text-gray-700 mb-4">
          El USUARIO y/o USUARIO ACTIVO y/o CLIENTE se compromete al respeto a
          la propiedad intelectual de LIBRERÍA UG VIRTUAL. El contenido de LA
          PÁGINA, ya sea material informático, gráfico, publicitario,
          fotográfico, de multimedia, audiovisual y de diseño, así como todos
          los contenidos, textos y bases de datos puestos a su disposición en LA
          PÁGINA, están protegidos por derechos de autor y/o propiedad
          industrial, cuyo titular es la Universidad de Guanajuato o sus
          vinculadas, en algunos casos, de terceros que han autorizado su uso o
          explotación. Igualmente, el uso en LA PÁGINA de algunos materiales de
          propiedad de terceros se encuentra expresamente autorizados por la ley
          o por dichos terceros. Todos los contenidos en LA PÁGINA están
          protegidos por las normas sobre derecho de autor y por todas las
          normas nacionales e internacionales que le sean aplicables. Ningún
          material que aparezca en LA PÁGINA podrá ser copiado, reproducido,
          distribuido, publicado, subido, descargado, transmitido o explotado de
          manera alguna, por ningún medio o soporte material, sin la
          autorización previa y por escrito de LIBRERÍA UG VIRTUAL o del titular
          de los respectivos derechos. En ningún caso estos TÉRMINOS confieren
          derechos, licencias ni autorizaciones para realizar los actos
          anteriormente prohibidos. Cualquier uso no autorizado de los
          contenidos constituirá una violación del presente documento y a las
          normas vigentes sobre derechos de autor, a las normas vigentes
          nacionales e internacionales sobre Propiedad Intelectual, y a
          cualquier otra que sea aplicable. LIBRERÍA UG VIRTUAL y otras marcas,
          nombres y avisos comerciales y otros distintivos que aparecen en LA
          PÁGINA, son propiedad de la Universidad de Guanajuato y en su caso de
          sus vinculados. El uso de cualquiera de nuestras marcas o cualquier
          otro contenido que se haga disponible a través de LA PÁGINA, está
          estrictamente prohibido. LIBRERÍA UG VIRTUAL podrá tomar las medidas
          que estime correspondientes para asegurar el respeto de la propiedad
          intelectual, en contra de actos de los USUARIOS o USUARIOS ACTIVOS.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Enlaces de terceros
        </h2>
        <p className="text-gray-700 mb-4">
          Este apartado se refiere a LA PÁGINA, por tanto, no es aplicable a los
          enlaces o a las páginas webs terceras que se puedan acceder a través
          de LA PÁGINA de LIBRERÍA UG VIRTUAL. Los terceros enlaces que se
          proporcionen en LA PÁGINA son de carácter informativo. Fuera de esto,
          LIBRERÍA UG VIRTUAL no es responsable del uso que puedan hacer esas
          terceras páginas webs, ni del contenido de las mismas, ni de ningún
          cambio o actualización de las mismas, y en ningún momento implican la
          aprobación por parte de LIBRERÍA UG VIRTUAL.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Responsabilidad de EDITORIAL UG VIRTUAL
        </h2>
        <p className="text-gray-700 mb-4">
          LIBRERÍA UG VIRTUAL procurará garantizar disponibilidad, continuidad y
          buen funcionamiento de LA PÁGINA. LIBRERÍA UG VIRTUAL podrá bloquear,
          interrumpir o restringir el acceso a LA PÁGINA cuando lo considere
          necesario, para el mejoramiento de LA PÁGINA o podrá dar de baja la
          misma. Se recomienda al USUARIO y/o USUARIO ACTIVO y/o CLIENTE tomar
          medidas adecuadas y actuar diligentemente al momento de acceder a LA
          PÁGINA, como, por ejemplo, contar con programas de protección,
          antivirus, para manejo de malware, spyware y herramientas similares.
          LIBRERÍA UG VIRTUAL no se hace responsable de los virus y cualquier
          software malicioso introducidos por terceros en los contenidos, que
          puedan producir cualquier problema, del uso ilícito que se pueda hacer
          de la misma por terceros, del contenido y de cualquier problema que
          haya con las páginas webs enlazadas.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Responsabilidad de EDITORIAL UG VIRTUAL sobre el contenido
        </h2>
        <p className="text-gray-700 mb-4">
          El USUARIO y/o USUARIO ACTIVO y/o CLIENTE entiende y acepta que
          LIBRERÍA UG VIRTUAL, como tal, no garantiza la precisión, integridad y
          calidad de todo el contenido publicado en LA PÁGINA. LIBRERÍA UG
          VIRTUAL no se hace responsable de cualquier error u omisión en el
          contenido, o por la pérdida o daño que surja como resultado del uso de
          la información contenida en LA PÁGINA.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Restricción de acceso y uso de LA PÁGINA
        </h2>
        <p className="text-gray-700 mb-4">
          A su exclusivo criterio, LIBRERÍA UG VIRTUAL podrá eliminar el
          contenido que esté disponible a través de LA PÁGINA por cualquier
          motivo o sin motivo alguno. El USUARIO y/o USUARIO ACTIVO y/o CLIENTE
          reconoce que LIBRERÍA UG VIRTUAL podrá, a su exclusivo criterio,
          restringir, suspender o cancelar su acceso a la totalidad o una parte
          de LA PÁGINA en cualquier momento, por cualquier motivo o ninguno en
          absoluto, sin previo aviso y sin estar sujeto a responsabilidad
          alguna.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Buen uso y usos prohibidos en la PÁGINA
        </h2>
        <p className="text-gray-700 mb-4">
          El USUARIO y/o USUARIO ACTIVO y/o CLIENTE se compromete a hacer buen
          uso de LA PÁGINA así como de los SERVICIOS ofertados, de conformidad
          con la Ley, el presente Aviso Legal, así como en los apartados de
          Política de Privacidad, Política de Cookies y Condiciones de Compra.
          LIBRERÍA UG VIRTUAL prevé a continuación una lista a modo de ejemplo
          enunciativa y no limitativa, de usos que considera prohibidos, siendo
          exclusivamente responsable el USUARIO y/o USUARIO ACTIVO y/o CLIENTE
          que realice los mismos, y estando LIBRERÍA UG VIRTUAL legitimada para
          eliminar su perfil de Usuario y tomar las medidas legales que estime
          conveniente: a) Queda prohibido cualquier actividad que implique el
          uso de LA PÁGINA con fines ilícitos, ilegales, engañosos o con malas
          intenciones. b) Queda prohibido cualquier tipo de actividad que
          implique la suplantación de la identidad de un USUARIO ACTIVO y el
          acceso a la cuenta de un tercero. c) Queda prohibido el suministro de
          datos falsos al momento de registrarse como Usuario en LA PÁGINA. d)
          Queda prohibido redactar, almacenar, distribuir o compartir cualquier
          contenido que vulnere la confidencialidad en las comunicaciones, los
          derechos de Propiedad Intelectual, y/o las normas de protección de los
          Datos Personales. e) Queda prohibido del uso del servicio para:
          introducir cualquier tipo de virus informático o programa informático
          dañino, también queda prohibido introducirse en el sistema de LIBRERÍA
          UG VIRTUAL y captar cualquier dato personal de los usuarios o de
          LIBRERÍA UG VIRTUAL.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Usuarios internacionales
        </h2>
        <p className="text-gray-700 mb-4">
          Todo USUARIO y/o USUARIO ACTIVO y/o CLIENTE, como condición para que
          use LA PÁGINA, acepta cumplir con todas las normas locales con
          respecto de su conducta en línea, incluidas todas las leyes, normas,
          códigos, reglamentaciones y en general todo cuerpo normativo del país
          en el que reside el USUARIO y/o USUARIO ACTIVO y/o CLIENTE, del país
          del que accede a LA PÁGINA y de los Estados Unidos Mexicanos.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          De LOS PRODUCTOS
        </h2>
        <p className="text-gray-700 mb-4">
          Dentro de LA PÁGINA en las SECCIONES “COLECCIONES” y “TEMÁTICAS”, se
          muestra el catálogo de libros impresos y digitales, en lo sucesivo LOS
          PRODUCTOS, los cuales se exhiben para la venta a los USUARIOS,
          USUARIOS ACTIVOS, y/o CLIENTES. En dicha sección, los USUARIOS,
          USUARIOS ACTIVOS, y/o CLIENTES podrán visualizar la descripción de LOS
          PRODUCTOS redactados en idioma español con letra clara y legible,
          descripción que contiene la siguiente información: el título del
          libro, portada, una reseña de la obra, nombre del autor, materia,
          idioma, sello editorial, número EAN, número ISBN, número de páginas,
          edición, fecha de publicación y precio neto en moneda nacional En el
          mismo sentido, y una vez realizada la compra, en la SECCIÓN “REALIZAR
          PEDIDO”, se muestra la forma de entrega incluyendo los costos, plazos,
          opciones de envío y para el caso de publicaciones digitales, el código
          de descarga. Por lo que hace a la responsabilidad de los prestadores
          de servicios de mensajería y paquetería, así como cualquier otra
          información que sea necesaria para los fines de la transacción
          comercial, deberá remitirse al apartado de Condiciones de Compra.
          Estos PRODUCTOS puede ser que no estén disponibles a pesar de estar
          exhibidos en LA PÁGINA, de igual forma los precios que están
          publicados en LA PÁGINA pueden ser modificados en cualquier momento y
          a consideración de LIBRERÍA UG VIRTUAL. Al leer, contemplar y/o
          solicitar la compra de algún PRODUCTO, USUARIO y/o USUARIO ACTIVO y/o
          CLIENTE deberá estar consciente que por ningún motivo LIBRERÍA UG
          VIRTUAL tendrá responsabilidad alguna por daños y perjuicios directos
          o indirectamente a consecuencia de la compra de los mismos, dado que
          el USUARIO y/o USUARIO ACTIVO y/o CLIENTE están conscientes que la
          información presentada del PRODUCTO, es suficiente para describir los
          productos, el mecanismo y condiciones de venta y recepción, y por lo
          tanto, permite al USUARIO y/o USUARIO ACTIVO y/o CLIENTE tome una
          decisión informada.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          De la comunicación
        </h2>
        <p className="text-gray-700 mb-4">
          Toda aquella comunicación que haya entre LIBRERÍA UG VIRTUAL a través
          de su personal, y los CLIENTES, USUARIOS y/o USUARIOS ACTIVOS será
          considerada como de carácter de confidencial. Toda comunicación con
          nuestro personal deberá ser únicamente a través del correo electrónico
          libreriaug@ugto.mx o al número telefónico (473) 732 00 06 ext. 2078,
          establecidos por LIBRERÍA UG VIRTUAL y atendidos por el ASESOR que
          LIBRERÍA UG VIRTUAL designe. Cualquier comunicación fuera de estos
          canales se considerará como extraoficial.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Fecha de última actualización
        </h2>
        <p className="text-gray-700 mb-4">
          La última actualización de los TÉRMINOS fue el 18 de noviembre de
          2021.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Modificaciones a los TÉRMINOS
        </h2>
        <p className="text-gray-700 mb-4">
          LIBRERÍA UG VIRTUAL podrá modificar los presentes TÉRMINOS en
          cualquier momento, haciendo públicos dichos cambios en LA PÁGINA.
          Todos los TÉRMINOS modificados entrarán en vigor a los diez (10) días
          siguientes a la publicación de las modificaciones introducidas. En
          caso de que USUARIO y/o USUARIO ACTIVO y/o CLIENTE no acepte las
          modificaciones, deberá hacerlo de conocimiento a LIBRERÍA UG VIRTUAL
          dentro del plazo de quince (15) días siguientes a la publicación de
          las modificaciones, enviando un correo electrónico a
          libreriaug@ugto.mx, y en ese caso, quedará disuelto el vínculo
          LIBRERÍA UG VIRTUAL y el USUARIO y/o USUARIO ACTIVO y/o CLIENTE y será
          inhabilitado como USUARIO. Vencido este plazo, se considerará que el
          USUARIO y/o USUARIO ACTIVO y/o CLIENTE acepta los nuevos términos.
        </p>
        <h2 className="text-2xl font-bold text-center text-[#003c71] mb-6">
          Competencia y Jurisdicción
        </h2>
        <p className="text-gray-700 mb-4">
          Los presentes TÉRMINOS, y la relación entre el USUARIO y/o USUARIO
          ACTIVO y/o CLIENTE y LIBRERÍA UG VIRTUAL, están regidos por las leyes
          de la República Mexicana, independientemente de sus disposiciones
          sobre conflictos de leyes. Con la aceptación de los presentes
          TÉRMINOS, acepta someterse a la competencia de los tribunales
          competentes en Guanajuato, Gto.
        </p>
        <p>
          <Link
            href="/"
            className="text-2xl font-light text-center text-gold mb-6 relative inline-block hover:font-bold after:content-[''] after:block after:w-full after:h-[2px] after:bg-yellow after:scale-x-0 after:transition-transform after:duration-300 after:origin-left hover:after:scale-x-100"
          >
            Regresar al inicio
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default AvisoPrivacidadPage;
