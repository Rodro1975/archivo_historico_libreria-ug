"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import "animate.css";
import EditorialLogo from "@/components/EditorialLogo";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false); // menú móvil
  const [isScrolled, setIsScrolled] = useState(false); // fondo transparente con scroll
  const [fallingHref, setFallingHref] = useState(null); // animación caída

  // Transparencia al hacer scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuItems = [
    { href: "/", label: "Catálogo Histórico" },
    { href: "/acercaDe", label: "Acerca de" },
    { href: "/login", label: "Iniciar Sesión" },
  ];

  // Click con animación de “caída” y navegación
  const handleLinkClick = (href) => (e) => {
    e.preventDefault();
    if (pathname === href) return; // no animar si ya estás ahí
    setFallingHref(href);
    setTimeout(() => {
      router.push(href);
      setFallingHref(null);
      setIsOpen(false);
    }, 800); // duración aprox de la animación
  };

  // Ocultar el link activo (no aparece mientras estás en esa ruta)
  const visibleItems = menuItems.filter((it) => it.href !== pathname);

  return (
    <nav
      className={[
        "sticky top-0 z-50 transition-colors duration-300",
        isScrolled
          ? "bg-transparent backdrop-blur-md"
          : "bg-white dark:bg-gray-900",
      ].join(" ")}
    >
      {/* ===== Fila superior: Logotipos ===== */}
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo UG */}
        <Link
          href="https://www.ugto.mx/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image
            src="/images/escudo-horizontal-png.png"
            alt="UGTO Logo"
            width={170}
            height={56}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* Logo Editorial UG */}
        <EditorialLogo />

        {/* Hamburguesa (móvil) */}
        <button
          onClick={() => setIsOpen((s) => !s)}
          type="button"
          aria-controls="navbar-bottom"
          aria-expanded={isOpen}
          className="md:hidden text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg p-2 ml-2"
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="sr-only">Abrir menú</span>
        </button>
      </div>

      {/* ===== Fila inferior: Enlaces + Redes ===== */}
      <div
        id="navbar-bottom"
        className={[
          "border-t border-gray-200 dark:border-gray-800",
          isScrolled ? "bg-transparent" : "bg-white/95 dark:bg-gray-900/95",
          "transition-colors duration-300",
          "md:block",
          isOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <div className="bg-gray-200 max-w-screen-xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Enlaces (oculta el activo) */}
          <ul className="flex flex-col md:flex-row md:space-x-8 font-medium">
            {visibleItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick(item.href)}
                  className={[
                    "block py-2 px-3 font-semibold",
                    "text-[#003c71]", // azul institucional
                    "hover:underline underline-offset-4",
                    fallingHref === item.href
                      ? "animate__animated animate__hinge"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Redes sociales (como en el footer) */}
          <div className="flex space-x-6 mt-3 md:mt-0">
            <Link
              href="https://www.facebook.com/EditorialUGTO"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A263D] hover:text-[#1877F2] transition-transform transform hover:scale-125 duration-300"
              aria-label="Facebook Editorial UG"
            >
              <FaFacebookF size={22} />
            </Link>
            <Link
              href="https://www.instagram.com/editorial_ug?igsh=MTFkZm9xdTVqeGppMw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A263D] hover:text-[#E4405F] transition-transform transform hover:scale-125 duration-300"
              aria-label="Instagram Editorial UG"
            >
              <FaInstagram size={22} />
            </Link>
          </div>
        </div>
      </div>

      {/* Animación alternativa (por si luego quieres dejar de usar animate.css) */}
      <style jsx global>{`
        @keyframes fallOut {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(80px) rotate(6deg);
          }
        }
        .fall-out {
          animation: fallOut 0.8s ease-in forwards;
        }
      `}</style>
    </nav>
  );
};

export default NavBar;
