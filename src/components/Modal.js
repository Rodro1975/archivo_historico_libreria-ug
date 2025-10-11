// components/Modal.js
"use client";

import React from "react";
import Image from "next/image";

const Modal = ({
  isOpen,
  imageSrc = "/images/guanajuato.jpg",
  headline = "1940",
  subtitle = "Descubre nuestra colección a través de la historia",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop oscuro */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Contenedor principal */}
      <div className="relative w-[92%] md:w-[82%] lg:w-[70%] h-[78%] md:h-[80%]">
        {/* Imagen base */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={imageSrc}
            alt="Colección histórica — imagen contextual"
            fill
            priority
            className="object-cover"
          />

          {/* Overlay 1: degradado para contraste (abajo más oscuro) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 pointer-events-none" />

          {/* Overlay 2: velo amarillo suave para contrarrestar el azul */}
          <div className="absolute inset-0 pointer-events-none mix-blend-soft-light bg-[radial-gradient(ellipse_at_center,rgba(242,193,46,0.45)_0%,rgba(242,193,46,0.15)_40%,transparent_70%)]" />

          {/* Contenido */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            {/* Headline (año) con “contorno” por sombras */}
            <h1
              className={[
                "font-extrabold tracking-tight mb-3",
                "text-[22vw] sm:text-8xl md:text-9xl lg:text-[11rem]",
                "text-yellow-400",
                "drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]",
                "shadow-[0_0_1px_rgba(0,0,0,0.9)]",
              ].join(" ")}
              style={{
                textShadow:
                  "0 0 2px rgba(0,0,0,0.85), 1px 1px 0 rgba(0,0,0,0.85), -1px 1px 0 rgba(0,0,0,0.85), 1px -1px 0 rgba(0,0,0,0.85), -1px -1px 0 rgba(0,0,0,0.85)",
                lineHeight: 0.9,
              }}
            >
              {headline}
            </h1>

            {/* Subtítulo en píldora con blur */}
            <p className="max-w-[92%] sm:max-w-[80%] md:max-w-[70%] text-white/95 text-base sm:text-lg md:text-xl lg:text-2xl leading-snug">
              <span className="inline-block rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-black/35 backdrop-blur-md border border-white/10">
                {subtitle}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
