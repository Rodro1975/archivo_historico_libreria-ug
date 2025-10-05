// src/app/layout.js
"use client";

import "animate.css";
import "tailwindcss/tailwind.css";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Script from "next/script"; // 👈 agrega esto

export default function RootLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    const getTitle = () => {
      switch (pathname) {
        case "/catalog":
          return "Galería - Archivo Histórico de la Editorial UG";
        case "/completeCatalog":
          return "Colección Documental - Archivo Histórico de la Editorial UG";
        case "/dashboard":
          return "Panel de Control - Archivo Histórico de la Editorial UG";
        case "/login":
          return "Iniciar Sesión - Archivo Histórico de la Editorial UG";
        case "/acercaDe":
          return "Acerca de - Archivo Histórico de la Editorial UG";
        default:
          return "Archivo Histórico de la Editorial UG";
      }
    };
    document.title = getTitle();
  }, [pathname]);

  return (
    <html lang="es">
      <head>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit"
          strategy="afterInteractive"
        />
      </head>

      <body className="antialiased">
        {/* Toaster global con estilo institucional */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#facc15", // amarillo
              color: "#1e3a8a", // azul
              fontWeight: "bold",
            },
            iconTheme: {
              primary: "#1e3a8a", // azul
              secondary: "#facc15", // amarillo
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
