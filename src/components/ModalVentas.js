// src/components/ModalVentas.js
"use client";

import Image from "next/image";
import Link from "next/link";

export default function ModalVentas() {
  return (
    <section className="bg-yellow py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Card glassy con efecto gold */}
        <div
          className="
            relative overflow-hidden rounded-2xl
            backdrop-blur-md bg-[#ffd300]/20 border border-[#ffd300]/40
            ring-1 ring-[#ffd300]/30 shadow-xl
            px-6 py-8 sm:px-8 sm:py-10
            text-center
            transition-transform duration-300 hover:scale-[1.02]
          "
        >
          {/* Glow dorado sutil */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffd300]/10 to-[#8c6e39]/20" />

          <h2 className="text-3xl font-semibold text-blue drop-shadow-sm relative z-10">
            ¿Quieres comprar o descargar un libro?
          </h2>

          <p className="mt-3 text-blue relative z-10">Ingresa a</p>

          {/* Logo con enlace */}
          <div className="mt-6 flex justify-center relative z-10">
            <Link
              href="https://libreriaug.ugto.mx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ir a libreriaug.ugto.mx"
              className="
                group inline-flex items-center rounded-xl
                bg-[#ffd300]/30 border border-[#ffd300]/40 ring-1 ring-[#ffd300]/20
                px-5 py-3
                transition-all duration-300 hover:bg-[#ffd300]/50 hover:shadow-2xl
              "
            >
              <Image
                src="/images/Logo_libreria.png"
                alt="Librería UG"
                width={220}
                height={64}
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
              <span className="sr-only">libreriaug.ugto.mx</span>
            </Link>
          </div>

          {/* URL pequeña opcional */}
          <div className="mt-2 relative z-10">
            <span
              className="
                text-xs font-medium
                bg-gradient-to-r from-blue to-orange
                bg-clip-text text-transparent
              "
            >
              libreriaug.ugto.mx
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
