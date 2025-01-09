// src/app/layout.js

"use client";

import "animate.css";
import "tailwindcss/tailwind.css"; // Tailwind CSS
import "./globals.css"; // Asegúrate de que la ruta sea correcta
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname(); // Obtener la ruta actual

  // Usar el hook de efecto para actualizar el título cuando cambie la ruta
  useEffect(() => {
    // Definir los títulos para cada ruta dentro del efecto
    const getTitle = () => {
      switch (pathname) {
        case "/catalog":
          return "Galeria - Archivo Histórico de la Editorial UG";
        case "/completeCatalog":
          return "Colección Documental - Archivo Histórico de la Editorial UG";
        case "/dashboard":
          return "Panel de Control - Archivo Histórico de la Editorial UG";
        case "/login":
          return "Iniciar Sesión - Archivo Histórico de la Editorial UG";
        case "/acercaDe":
          return "Acerca de - Archivo Histórico de la Editorial UG";
        default:
          return "Archivo Histórico de la Editorial UG"; // Título por defecto
      }
    };

    document.title = getTitle();
  }, [pathname]);

  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
