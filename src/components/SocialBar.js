// components/SocialBar.js
import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { SiX } from "react-icons/si";
import Image from "next/image";
import Link from "next/link";

const SocialBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-800 z-30">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
        {/* Logo: sin <a> adicional */}
        <Link
          href="https://www.ugto.mx/editorial/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <Image
            src="/images/editorial-ug.png"
            alt="Editorial UG"
            width={150}
            height={50}
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Iconos de redes sociales */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-600 transition"
          >
            <FaFacebookF size={20} />
          </Link>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 transition"
          >
            <FaInstagram size={20} />
          </Link>
          <Link
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-red-600 transition"
          >
            <FaYoutube size={20} />
          </Link>
          <Link
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-black transition"
          >
            <SiX size={20} />
          </Link>
          <Link
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-black transition"
          >
            <FaTiktok size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SocialBar;
