"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import UserProfileCard from "@/components/UserProfileCard";
import {
  AiOutlineDashboard,
  AiOutlinePlus,
  AiOutlineKey,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import ModalSoporte from "@/components/ModalSoporte";
import ModalCambioContrasena from "@/components/ModalCambioContrasena"; // ✅ nuevo import
// Estilo para los toasts
const ProfilePage = () => {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); // ✅ nuevo estado

  useEffect(() => {
    const mensaje = localStorage.getItem("fotoSubidaExito");
    if (mensaje) {
      toastSuccess(mensaje, toastStyle);
      localStorage.removeItem("fotoSubidaExito");
    }
  }, []);
  // verificar sesión y cargar datos del usuario
  useEffect(() => {
    const fetchSessionAndData = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("Error de sesión:", sessionError);
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select(
          `
          id,
          primer_nombre,
          segundo_nombre,
          apellido_paterno,
          apellido_materno,
          email,
          telefono,
          role,
          justificacion,
          es_autor,
          fecha_creacion,
          fecha_modificacion,
          foto
        `
        )
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error cargando datos del usuario:", userError.message);
        setLoading(false);
        return;
      }

      let dependencias = null;
      let unidades_academicas = null;

      if (usuario.es_autor) {
        const { data: autor, error: autorError } = await supabase
          .from("autores")
          .select(
            `
            id,
            dependencia:dependencia_id(nombre),
            unidad_academica:unidad_academica_id(nombre)
          `
          )
          .eq("usuario_id", usuario.id)
          .single();

        if (!autorError) {
          dependencias = autor.dependencia;
          unidades_academicas = autor.unidad_academica;
        }
      }
      // combinar datos y actualizar estado
      setUserData({
        ...usuario,
        dependencias,
        unidades_academicas,
      });

      setLoading(false);
    };

    fetchSessionAndData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-16 text-blue text-lg font-semibold animate-pulse">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg border-l-8 border-yellow p-12 flex flex-col gap-12">
        <header className="flex justify-between items-center">
          <div className="w-44 sm:w-52 relative">
            <Image
              src="/images/escudo-horizontal-png.png"
              alt="Escudo Universidad de Guanajuato"
              width={224}
              height={74}
              className="object-contain"
              priority
            />
          </div>
          <div className="w-40 sm:w-48 relative">
            <Image
              src="/images/editorial-ug.png"
              alt="Editorial UG"
              width={192}
              height={70}
              className="object-contain"
              priority
            />
          </div>
        </header>

        {/* Botones hexagonales */}
        <nav className="flex flex-wrap gap-6 justify-center sm:justify-start">
          <button
            type="button"
            className="hexagon-button flex flex-col items-center justify-center"
            aria-label="Volver al dashboard"
            onClick={() => router.push("/dashboard")}
          >
            <AiOutlineDashboard className="text-3xl mb-1" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Dashboard
            </span>
          </button>

          <button
            type="button"
            className="hexagon-button flex flex-col items-center justify-center"
            aria-label="Soporte"
            onClick={() => setShowSupportModal(true)}
          >
            <AiOutlinePlus className="text-3xl mb-1" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Soporte
            </span>
          </button>

          {/* ✅ Nuevo botón de cambio de contraseña */}
          <button
            type="button"
            className="hexagon-button flex flex-col items-center justify-center"
            aria-label="Cambiar contraseña"
            onClick={() => setShowChangePasswordModal(true)}
          >
            <AiOutlineKey className="text-3xl mb-1" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Contraseña
            </span>
          </button>
        </nav>

        <section className="text-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue to-gold tracking-widest drop-shadow-lg uppercase select-none">
            Mi Perfil
          </h1>
          <p className="mt-3 text-gray-700 italic text-sm max-w-xl mx-auto">
            Aquí puedes consultar tu información personal y académica.
          </p>
          <div className="mt-5 mx-auto w-28 h-1 rounded-full bg-gold shadow-md" />
        </section>

        <main className="animate-fade-in">
          <UserProfileCard userData={userData} />
        </main>

        <section className="mt-12 bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-blue mb-4 text-center">
            Permisos según tu rol
          </h2>
          <p className="text-sm text-gray-700 text-center mb-6 max-w-xl mx-auto">
            A continuación puedes ver un resumen de las acciones que tienes
            disponibles según tu rol actual:{" "}
            <strong className="text-blue">{userData.role}</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-blue border border-gray-300">
              <thead className="bg-yellow text-black">
                <tr>
                  <th className="px-4 py-2 border">Funcionalidad</th>
                  <th className="px-4 py-2 border">Admin</th>
                  <th className="px-4 py-2 border">Editor</th>
                  <th className="px-4 py-2 border">Lector</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["CRUD usuarios", "✅", "❌", "❌"],
                  ["CRUD autores", "✅", "✅", "❌"],
                  ["CRUD lectores", "✅", "❌", "❌"],
                  ["CRUD libros", "✅", "✅", "❌"],
                  ["Ver/generar reportes completos", "✅", "❌", "❌"],
                  ["Ver/generar reportes limitados", "✅", "✅", "❌"],
                  ["Ver preguntas frecuentes", "✅", "✅", "✅"],
                  ["Acceso a perfil", "✅", "✅", "✅"],
                  ["Enviar solicitudes de soporte", "✅", "✅", "✅"],
                  ["Ver panel", "Completo", "Medio", "Limitado"],
                ].map(([funcion, admin, editor, lector], idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{funcion}</td>
                    <td className="px-4 py-2 border text-center">{admin}</td>
                    <td className="px-4 py-2 border text-center">{editor}</td>
                    <td className="px-4 py-2 border text-center">{lector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal soporte */}
        {showSupportModal && (
          <ModalSoporte
            isOpen={showSupportModal}
            onClose={() => setShowSupportModal(false)}
            userId={userData.id}
          />
        )}

        {/* ✅ Modal cambio contraseña */}
        {showChangePasswordModal && (
          <ModalCambioContrasena
            isOpen={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            userId={userData.id}
          />
        )}
      </div>

      {/* Estilos hexagonales */}
      <style jsx>{`
        .hexagon-button {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 104px;
          padding: 0.8rem 1.2rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          color: black;
          text-transform: uppercase;
          clip-path: polygon(
            50% 0%,
            93% 25%,
            93% 75%,
            50% 100%,
            7% 75%,
            7% 25%
          );
          background-color: #facc15;
          transition: all 0.3s ease;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          user-select: none;
          border: none;
          outline: none;
        }

        .hexagon-button:hover,
        .hexagon-button:focus-visible {
          transform: translateY(-4px);
          background-color: #003366;
          color: white;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
        }

        .hexagon-button:hover svg,
        .hexagon-button:focus-visible svg {
          color: inherit;
          fill: currentColor;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
