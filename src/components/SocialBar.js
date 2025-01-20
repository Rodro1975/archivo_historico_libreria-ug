// components/SocialBar.js
import React from "react";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa"; // Importa iconos de react-icons
import { SiX } from "react-icons/si"; // Importa el icono de X
import Image from "next/image";
import Link from "next/link";

const SocialBar = () => {
  return (
    <div className="sticky top-0 flex justify-center items-center p-4 bg-gray-800 z-30">
      <Image
        src="/images/editorial-ug.png"
        alt="Editorial Logo"
        width={150}
        height={50}
        className="h-12 w-auto rounded-md mr-6"
      />
      {/* Iconos de redes sociales */}
      <div className="flex space-x-6">
        {" "}
        {/* Utiliza flex y espacio entre iconos */}
        <Link 
  href="https://www.facebook.com" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-blue-600 transition duration-300"
>
  <FaFacebookF size={24} />
</Link>
<Link 
  href="https://www.instagram.com" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-pink-500 transition duration-300"
>
  <FaInstagram size={24} />
</Link>
<Link 
  href="https://www.youtube.com" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-red-600 transition duration-300"
>
  <FaYoutube size={24} />
</Link>
<Link 
  href="https://x.com" // Enlace a X (antes Twitter)
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-black transition duration-300"
>
  <SiX size={24} /> {/* Icono de X */}
</Link>
<Link 
  href="https://www.tiktok.com" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="text-white hover:text-black transition duration-300"
>
  <FaTiktok size={24} />
</Link>
      </div>
    </div>
  );
};

export default SocialBar;
