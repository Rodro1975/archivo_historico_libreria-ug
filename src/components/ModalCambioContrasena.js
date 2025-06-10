"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Image from "next/image";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

const ModalCambioContrasena = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (field, value) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = () => {
    if (!passwords.current.trim()) {
      toast.error("Ingresa tu contraseña actual", toastStyle);
      return false;
    }

    if (passwords.new.length < 6) {
      toast.error(
        "La nueva contraseña debe tener al menos 6 caracteres",
        toastStyle
      );
      return false;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("Las nuevas contraseñas no coinciden", toastStyle);
      return false;
    }

    if (passwords.current === passwords.new) {
      toast.error(
        "La nueva contraseña debe ser diferente a la actual",
        toastStyle
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setLoading(true);

    try {
      // Verificar contraseña actual intentando hacer sign in
      const {
        data: { user },
        error: currentPasswordError,
      } = await supabase.auth.getUser();

      if (currentPasswordError || !user) {
        toast.error("Error de autenticación", toastStyle);
        setLoading(false);
        return;
      }

      // Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (updateError) {
        console.error("Error al actualizar contraseña:", updateError);

        // Manejar errores específicos
        if (updateError.message.includes("Password should be at least")) {
          toast.error(
            "La contraseña es muy débil. Debe tener al menos 6 caracteres",
            toastStyle
          );
        } else if (
          updateError.message.includes("Unable to validate current password")
        ) {
          toast.error("La contraseña actual es incorrecta", toastStyle);
        } else {
          toast.error(
            "Error al cambiar contraseña. Inténtalo de nuevo",
            toastStyle
          );
        }
        setLoading(false);
        return;
      }

      // Éxito
      toast.success("✅ Contraseña actualizada exitosamente", toastStyle);

      // Limpiar formulario
      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado. Inténtalo de nuevo", toastStyle);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="text-blue bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border-4 border-yellow relative animate-fade-in">
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

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-blue hover:text-gold transition text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>

        {/* Título */}
        <h2 className="text-2xl font-extrabold mb-6 text-center text-blue uppercase tracking-wide">
          🔒 Cambiar Contraseña
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => handleChange("current", e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none pr-12"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue hover:text-gold transition"
              >
                {showPasswords.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => handleChange("new", e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none pr-12"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue hover:text-gold transition"
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              La contraseña debe tener al menos 6 caracteres
            </p>
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label className="block text-sm font-bold text-blue mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-yellow focus:border-blue focus:ring-2 focus:ring-blue transition outline-none pr-12"
                placeholder="Repite la nueva contraseña"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue hover:text-gold transition"
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
            {passwords.new &&
              passwords.confirm &&
              passwords.new !== passwords.confirm && (
                <p className="text-xs text-red-600 mt-1">
                  Las contraseñas no coinciden
                </p>
              )}
            {passwords.new &&
              passwords.confirm &&
              passwords.new === passwords.confirm && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Las contraseñas coinciden
                </p>
              )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-lg bg-orange text-white font-semibold hover:bg-yellow hover:text-blue transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-blue text-white font-semibold hover:bg-gold transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cambiando...
                </>
              ) : (
                <>🔒 Cambiar</>
              )}
            </button>
          </div>
        </form>

        {/* Nota de seguridad */}
        <div className="mt-6 p-3 bg-yellow/20 rounded-lg border border-yellow">
          <p className="text-xs text-blue text-center">
            <strong>💡 Tip de seguridad:</strong> Usa una contraseña fuerte que
            incluya letras, números y símbolos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioContrasena;
