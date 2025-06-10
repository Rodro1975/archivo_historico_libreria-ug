"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Image from "next/image";
import emailjs from "emailjs-com";
const toastStyle = {
  style: {
    background: "#facc15", // amarillo
    color: "#1e3a8a", // azul oscuro
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

// Cambio 2: Simplificar la inicialización igual que en el código funcional
emailjs.init("1Z9rEYtD53y4HwJCo"); // Tu Public Key
const ASUNTOS = [
  { value: "", label: "Selecciona el asunto" },
  {
    value: "Problemas con inicio de sesión",
    label: "Problemas con inicio de sesión",
  },
  {
    value: "Solicitud de cambio de contraseña",
    label: "Solicitud de cambio de contraseña",
  },
  {
    value: "Error al crear o editar usuarios",
    label: "Error al crear o editar usuarios",
  },
  {
    value: "Error al crear o editar autores",
    label: "Error al crear o editar autores",
  },
  {
    value: "Error al crear o editar libros",
    label: "Error al crear o editar libros",
  },
  {
    value: "Problemas con la carga de archivos",
    label: "Problemas con la carga de archivos",
  },
  { value: "Problemas con compiladores", label: "Problemas con compiladores" },
  {
    value: "Dudas sobre permisos o roles",
    label: "Dudas sobre permisos o roles",
  },
  {
    value: "Solicitud de acceso a nueva funcionalidad",
    label: "Solicitud de acceso a nueva funcionalidad",
  },
  {
    value: "Reporte de bug en la plataforma",
    label: "Reporte de bug en la plataforma",
  },
  { value: "Sugerencia de mejora", label: "Sugerencia de mejora" },
  { value: "Otro", label: "Otro (especificar en la descripción)" },
];
export default function ModalSoporte({ isOpen = true, onClose, userId }) {
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Usuario");

  // 🔍 Cargar nombre del usuario desde la tabla 'usuarios'
  useEffect(() => {
    const fetchUserName = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("usuarios")
        .select("primer_nombre, apellido_paterno")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error al obtener usuario:", error);
        return;
      }
      const fullName = `${data.primer_nombre ?? ""} ${
        data.apellido_paterno ?? ""
      }`.trim();
      setUserName(fullName || "Usuario");
    };
    fetchUserName();
  }, [userId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asunto) {
      toast.error("Por favor selecciona el asunto.", toastStyle);
      return;
    }
    if (!prioridad) {
      toast.error("Por favor selecciona la prioridad.", toastStyle);
      return;
    }
    setLoading(true);
    try {
      // Primero guardar en Supabase
      const { error } = await supabase.from("soporte").insert({
        usuario_id: userId,
        asunto,
        descripcion,
        prioridad,
        estado: "pendiente",
      });
      if (error) {
        toast.error("Error al guardar en la base de datos.", toastStyle);
        setLoading(false);
        return;
      }
      // Cambio 3: Envío de correo con parámetros correctos (sin to_email)
      // ✅ CÓDIGO CORREGIDO
      await emailjs.send("service_t0p7qz9", "template_r7bizxo", {
        name: userName,
        title: asunto,
        prioridad: prioridad,
        descripcion: descripcion,
        email: "rodrigoivanordonezchavez@gmail.com", // ← AGREGADO
      });
      toast.success("Solicitud enviada y correo notificado.", toastStyle);
      setAsunto("");
      setDescripcion("");
      setPrioridad("");
      onClose();
    } catch (emailError) {
      console.error("Error al enviar correo:", emailError);
      toast.error(
        "Se guardó en soporte, pero falló el envío del correo.",
        toastStyle
      );
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="text-blue bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border-4 border-yellow relative">
        {/* Logo Editorial UG */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/editorial-ug.png"
            alt="Editorial UG"
            width={140}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-blue hover:text-gold transition text-2xl"
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-extrabold mb-6 text-center text-blue uppercase tracking-wide">
          Formulario de Soporte
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Asunto
            </label>
            <select
              className="w-full p-2 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none bg-white"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              required
            >
              {ASUNTOS.map((op) => (
                <option
                  key={op.value}
                  value={op.value}
                  disabled={op.value === ""}
                >
                  {op.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Descripción
            </label>
            <textarea
              className="w-full p-2 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none"
              rows="4"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              placeholder="Explica el problema o solicitud con detalle"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Prioridad
            </label>
            <select
              className="w-full p-2 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none bg-white"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona la prioridad
              </option>
              <option value="baja" className="text-orange font-bold">
                Baja
              </option>
              <option value="media" className="text-yellow font-bold">
                Media
              </option>
              <option value="alta" className="text-gold font-bold">
                Alta
              </option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-orange text-white font-semibold hover:bg-yellow transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue text-white font-semibold hover:bg-gold transition flex items-center"
            >
              {loading ? (
                <span className="animate-pulse">Enviando...</span>
              ) : (
                "Enviar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
