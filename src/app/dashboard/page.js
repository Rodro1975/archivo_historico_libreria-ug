"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PanelAdmin from "@/components/PanelAdmin";
import PanelEditor from "@/components/PanelEditor";
import PanelReader from "@/components/PanelReader";

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
        router.push("/login");
      } else {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("primer_nombre, apellido_paterno, role, foto")
      .eq("id_auth", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);
    } else {
      setUserData(data);
    }
  };

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  // Rol del usuario
  const userRole = userData?.role;

  return (
    <div className="bg-gray-100 min-h-screen">
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
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {/* Mostrar panel según el rol */}
        {userRole === "Administrador" && <PanelAdmin />}
        {userRole === "Editor" && <PanelEditor />}
        {userRole === "Lector" && <PanelReader />}
      </div>
    </div>
  );
};

export default DashboardPage;
