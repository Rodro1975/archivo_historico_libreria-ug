/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Habilita el modo estricto de React para ayudar a encontrar errores
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jtvybltxabrnydepbqgk.supabase.co", // Asegúrate de agregar el dominio correcto
        pathname: "/storage/v1/object/public/portadas/**", // El patrón del path para las imágenes
      },
    ],
  },
};

export default nextConfig;
