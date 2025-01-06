"use client";

import React, { useState } from "react"; // Asegúrate de importar useState
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import SocialBar from "@/components/SocialBar"; // Asegúrate de que la ruta sea correcta

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); //start router

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Lógica de inicio de sesión
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      setError(error.message); // Muestra el mensaje de error
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div>
      {/* Aquí se encuentra el componente SocialBar, fuera del formulario */}
      <SocialBar />

      <div
        style={{
          maxWidth: "400px",
          margin: "50px auto",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Muestra el error si existe */}
      </div>
    </div>
  );
};

export default LoginForm;

