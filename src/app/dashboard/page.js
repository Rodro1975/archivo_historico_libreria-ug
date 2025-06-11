"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PanelAdmin from "@/components/PanelAdmin";
import PanelEditor from "@/components/PanelEditor";
import PanelReader from "@/components/PanelReader";
import { toast, Toaster } from "react-hot-toast"; // ✅ Toast importado

// ✅ Estilos personalizados para toast
const toastStyle = {
  style: {
    background: "#facc15", // amarillo
    color: "#1e3a8a", // azul
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a", // azul
    secondary: "#facc15", // amarillo
  },
};

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.log("Sesión no válida, redirigiendo a /login");
        toast.error("Debes iniciar sesión para continuar", toastStyle);
        router.push("/login");
        setLoading(false);
        return;
      }

      const { data, error: userError } = await supabase
        .from("usuarios")
        .select("primer_nombre, apellido_paterno, role, foto")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        console.error("Error al obtener datos del usuario:", userError.message);
        toast.error("Error al cargar perfil del usuario", toastStyle);
      } else {
        setUserData(data);
        toast.success("Inicio de sesión exitoso", toastStyle);
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  const userRole = userData?.role;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-right" /> {/* ✅ Toast en pantalla */}
      <Sidebar />
      <header className="bg-blue text-white py-6 text-center">
        {userData?.foto && (
          <img
            src={userData.foto}
            alt={`${userData.primer_nombre} ${userData.apellido_paterno}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-orange mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold">
          Bienvenido a tu espacio de trabajo, {userData?.primer_nombre}{" "}
          {userData?.apellido_paterno}
        </h1>
        <p className="text-xl text-yellow-300">
          Rol: {userData?.role || "No especificado"}
        </p>
      </header>
      <main className="p-6 text-center">
        <p className="text-blue">
          ¡Explora las funcionalidades de tu dashboard!
        </p>
      </main>
      <div className="mt-5 text-center">
        {userRole === "Administrador" && <PanelAdmin />}
        {userRole === "Editor" && <PanelEditor />}
        {userRole === "Lector" && <PanelReader />}
      </div>
    </div>
  );
};

export default DashboardPage;
