"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase"; // Asegúrate de que esta ruta sea correcta

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
        // Aquí obtenemos el ID del usuario autenticado
        const userId = session.user.id; // Asegúrate de que este ID corresponda a tu tabla
        fetchUserData(userId); // Llama a la función para obtener datos del usuario
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("primer_nombre, apellido_paterno, role") // Asegúrate de que estos campos existan en tu tabla
      .eq("id_auth", userId) // Cambia "id_auth" por el campo correcto que uses para identificar al usuario
      .single(); // Usamos single() porque esperamos un solo resultado

    if (error) {
      console.error("Error fetching user data:", error.message);
    } else {
      setUserData(data); // Almacena los datos del usuario
    }
  };

  if (loading) return <h1>Cargando...</h1>;

  return (
    <div>
      <h1>
        Bienvenido,{" "}
        {userData
          ? `${userData.primer_nombre} ${userData.apellido_paterno}`
          : "Usuario"}
      </h1>
      <p>Rol: {userData?.role || "No especificado"}</p>
    </div>
  );
};

export default DashboardPage;
