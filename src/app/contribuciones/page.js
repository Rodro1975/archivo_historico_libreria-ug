// app/contribuciones/page.js
"use client";

import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

const Chip = ({ href, children }) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
      border border-white/20 bg-white/10 backdrop-blur
      hover:bg-white/20 transition-colors
    "
    style={{ color: "#fff" }}
  >
    {children}
    <span aria-hidden>↗</span>
  </Link>
);

const Card = ({ title, children }) => (
  <div
    className="
      relative rounded-2xl p-6
      border border-white/20 bg-white/10 backdrop-blur-xl
      shadow-[0_12px_40px_rgba(0,0,0,0.35)]
    "
  >
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <div className="text-white/90">{children}</div>
  </div>
);

export default function ContribucionesPage() {
  return (
    <div className="relative min-h-screen w-full isolate">
      <NavBar />

      <main className="px-4 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          {/* Contenedor principal glassy */}
          <div
            className="
              relative rounded-3xl overflow-hidden
              border border-white/25 ring-1 ring-white/20
              bg-white/10 backdrop-blur-2xl
              shadow-[0_20px_60px_rgba(0,0,0,0.45)]
            "
          >
            {/* Barra de acento superior brand */}
            <div
              className="absolute left-0 right-0 top-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-yellow) 0%, var(--color-orange) 50%, var(--color-gold) 100%)",
              }}
            />

            {/* Cabecera */}
            <header className="px-6 md:px-12 pt-10 md:pt-14 pb-8 text-center">
              <Image
                src="/images/editorial-ug.png"
                alt="Editorial UG"
                width={140}
                height={140}
                className="mx-auto mb-5"
                priority
              />
              <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
                Contribuciones y Agradecimientos
              </h1>
              <p className="mt-3 text-white/80 max-w-2xl mx-auto">
                Este proyecto del <strong>Catálogo Histórico (UG)</strong> fue
                posible gracias a la colaboración de múltiples personas, equipos
                y comunidades.
              </p>
            </header>

            {/* Grid de secciones */}
            <section className="px-6 md:px-12 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agradecimientos especiales */}
                <Card title="Agradecimientos especiales">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      A la <strong>Universidad de Guanajuato</strong> por el
                      apoyo institucional y por permitir el desarrollo de este
                      proyecto de titulación.
                    </li>
                    <li>
                      A <strong>Editorial UG</strong> y al personal de
                      biblioteca/archivo por su orientación, apertura y
                      facilidades en el acceso a materiales.
                    </li>
                    <li>
                      En especial a la Doctora{" "}
                      <em>Elba Margarita Sanchez Rolón</em> por su
                      disponibilidad y atención.
                    </li>
                    <li>
                      A mi asesora de titulación{" "}
                      <em>Elena Abigail Solís Garza</em> por su guía académica y
                      acompañamiento.
                    </li>
                    <li>
                      A mi asesor externo <em>Aldo Alberto Lugo Monjaras</em>{" "}
                      por su acompañamiento y profesionalismo.
                    </li>
                    <li>
                      A las y los colaboradores, revisores y voluntariado que
                      brindaron su tiempo en pruebas, retroalimentación y
                      organización del contenido.
                    </li>
                  </ul>
                </Card>

                {/* Créditos adicionales */}
                <Card title="Créditos adicionales / comunidad">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Personas beta tester y revisores de contenido{" "}
                      <em>[Nombres opcionales]</em>.
                    </li>
                    <li>
                      Apoyo logístico y de infraestructura{" "}
                      <em>[Dependencias/Áreas UG]</em>.
                    </li>
                    <li>
                      Donaciones o patrocinios (si aplica) <em>[Entidad]</em>.
                    </li>
                  </ul>
                </Card>

                {/* Imágenes */}
                <Card title="Imágenes">
                  <p className="mb-3">
                    Agradecemos a las y los autores y a las plataformas por los
                    recursos visuales:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip href="https://unsplash.com">Unsplash</Chip>
                    {/* Aquí se Agregan más chips si se tienen fuentes adicionales */}
                  </div>
                </Card>

                {/* Íconos */}
                <Card title="Íconos">
                  <p className="mb-3">
                    Conjunto de íconos empleados en la interfaz:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Chip href="https://fontawesome.com">Font Awesome</Chip>
                    <Chip href="https://fonts.google.com/icons">
                      Material Icons
                    </Chip>
                    <Chip href="https://www.flaticon.com">Flaticon</Chip>
                  </div>
                </Card>

                {/* Bibliotecas y herramientas */}
                <Card title="Bibliotecas y herramientas">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <Link
                        href="https://nextjs.org"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Next.js
                      </Link>{" "}
                      — framework de la aplicación.
                    </li>
                    <li>
                      <Link
                        href="https://tailwindcss.com"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Tailwind CSS
                      </Link>{" "}
                      — sistema de estilos utilitarios.
                    </li>
                    <li>
                      <Link
                        href="https://getbootstrap.com"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Bootstrap
                      </Link>{" "}
                      — componentes de apoyo en UI.
                    </li>
                    <li>
                      <Link
                        href="https://supabase.com"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Supabase
                      </Link>{" "}
                      — autenticación, base de datos y almacenamiento.
                    </li>
                    <li>
                      <Link
                        href="https://nodejs.org/en"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Node.js
                      </Link>{" "}
                      — entorno de ejecución JS.
                    </li>
                    <li>
                      <Link
                        href="https://code.visualstudio.com/"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Visual Studio Code
                      </Link>{" "}
                      — editor de código.
                    </li>
                  </ul>
                </Card>

                {/* Licencias */}
                <Card title="Licencias">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Imágenes y gráficos bajo{" "}
                      <Link
                        href="https://creativecommons.org/licenses/by/4.0/"
                        target="_blank"
                        className="underline decoration-[var(--color-yellow)] underline-offset-4"
                      >
                        Creative Commons Attribution 4.0
                      </Link>
                      , salvo indicación específica.
                    </li>
                    <li>
                      Los paquetes, íconos y bibliotecas respetan las licencias
                      de sus proveedores.
                    </li>
                    {/* Si tu código tiene licencia, añádela aquí: */}
                    <li>
                      Código del proyecto:{" "}
                      <em>[Tipo de licencia, p. ej. MIT/Apache 2.0]</em>.
                    </li>
                  </ul>
                </Card>
              </div>

              {/* CTA regresar */}
              <div className="mt-10 text-center">
                <Link
                  href="/"
                  className="
                    inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium
                    border border-white/25 bg-white/10 backdrop-blur
                    hover:bg-white/20 transition-colors
                  "
                  style={{ color: "#fff" }}
                >
                  ← Regresar al inicio
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
