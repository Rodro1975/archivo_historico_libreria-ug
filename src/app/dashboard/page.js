"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import PanelAdmin from "@/components/PanelAdmin";
import PanelEditor from "@/components/PanelEditor";
import { toastSuccess, toastError } from "@/lib/toastUtils";

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastShown, setToastShown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toastError("Debes iniciar sesión para continuar");

        router.push("/login");
        setLoading(false);
        return;
      }

      const email = session.user.email;

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("primer_nombre, apellido_paterno, role, foto")
        .eq("email", email)
        .maybeSingle();

      if (userError || !userData) {
        toastError("Usuario no autorizado o no encontrado");

        router.push("/login");
        setLoading(false);
        return;
      }

      setUserData(userData);

      // ✅ Mostrar el toast solo si vienes del login
      const cameFromLogin =
        performance.getEntriesByType("navigation")[0].type === "navigate";

      if (cameFromLogin) {
        toastSuccess("Inicio de sesión exitoso");
      }

      setLoading(false);
    };

    checkSession();
  }, [router, toastShown]);

  if (loading) return <h1 className="text-center mt-10">Cargando...</h1>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <header className="bg-blue text-white py-6 text-center">
        {userData?.foto && (
          <img
            src={userData.foto}
            alt={`${userData.primer_nombre} ${userData.apellido_paterno || ""}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-orange mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold">
          Bienvenido a tu espacio de trabajo, {userData?.primer_nombre}{" "}
          {userData?.apellido_paterno || ""}
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
        {userData?.role === "Administrador" && <PanelAdmin />}
        {userData?.role === "Editor" && <PanelEditor />}
      </div>
    </div>
  );
};

export default DashboardPage;
