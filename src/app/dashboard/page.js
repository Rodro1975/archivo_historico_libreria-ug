"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase"; // Asegúrate de que esta ruta sea correcta
import Image from "next/image";

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
        const userId = session.user.id; // Asegúrate de que este ID corresponda a tu tabla
        fetchUserData(userId);
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("primer_nombre, apellido_paterno, role, foto") // Incluye el campo 'foto'
      .eq("id_auth", userId) // Cambia "id_auth" por el campo correcto que uses para identificar al usuario
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);
    } else {
      setUserData(data); // Almacena los datos del usuario
    }
  };

  if (loading) return <h1>Cargando...</h1>;

  return (
    <div
      style={{
        backgroundColor: "var(--color-gray)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <header
        style={{
          width: "100%",
          backgroundColor: "var(--color-blue)",
          color: "white",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        {userData?.foto && (
          <img
            src={userData.foto}
            alt={`${userData.primer_nombre} ${userData.apellido_paterno}`}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid var(--color-orange)",
              marginBottom: "15px",
            }}
          />
        )}
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 10px" }}>
          Bienvenido a tu espacio de trabajo:{" "}
          {userData
            ? `${userData.primer_nombre} ${userData.apellido_paterno}`
            : "Usuario"}
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--color-gold)",
            marginTop: "5px",
          }}
        >
          Rol:{" "}
          <span style={{ fontWeight: "300" }}>
            {userData?.role || "No especificado"}
          </span>
        </p>
      </header>

      <main style={{ padding: "20px", textAlign: "center" }}>
        {/* Aquí puedes añadir el contenido principal del dashboard */}
        <p style={{ color: "var(--color-navy)" }}>
          ¡Explora las funcionalidades de tu dashboard!
        </p>
      </main>
    </div>
  );
};

export default DashboardPage;
