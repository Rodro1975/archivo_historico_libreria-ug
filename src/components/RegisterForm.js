"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { toast } from "react-hot-toast";

const toastStyle = {};

// Esquema de validación con Zod
const RegisterSchema = z
  .object({
    primer_nombre: z.string().min(2, {
      message: "El primer nombre debe tener al menos 2 caracteres.",
    }),
    segundo_nombre: z.string().min(2, {
      message: "El segundo nombre debe tener al menos 2 caracteres",
    }),
    apellido_paterno: z.string().min(2, {
      message: "El apellido paterno debe tener al menos 2 caracteres",
    }),
    apellido_materno: z.string().min(2, {
      message: "El apellido materno debe tener al menos 2 caracteres",
    }),
    email: z
      .string()
      .email({ message: "Por favor, ingresa un correo electrónico válido." }),
    telefono: z
      .string()
      .optional()
      .refine((value) => !value || /^\d+$/.test(value), {
        message: "Por favor, ingresa solo números en el campo teléfono.",
      }),
    justificacion: z.string().max(300, {
      message: "La justificación no puede exceder los 300 caracteres.",
    }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
      .regex(/[a-zA-Z]/, {
        message: "La contraseña debe contener al menos una letra.",
      })
      .regex(/[0-9]/, {
        message: "La contraseña debe contener al menos un número.",
      })
      .regex(/[^a-zA-Z0-9]/, {
        message: "La contraseña debe contener al menos un carácter especial.",
      }),
    confirmar_password: z.string(),
    role: z.string().nonempty({ message: "El rol es obligatorio." }),
  })
  .refine((data) => data.password === data.confirmar_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_password"],
  });

const roles = ["Administrador", "Editor"];

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); // Nuevo estado de loading
  const router = useRouter();
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Validar que se haya seleccionado una foto antes de proceder
      if (!selectedFile) {
        toastError(
          "Por favor selecciona una foto antes de continuar",
          toastStyle
        );
        setLoading(false);
        return;
      }

      // Mostrar mensaje de inicio
      toast.loading("Registrando usuario...", { id: "registro" });

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error("Error al registrar en Auth:", authError);

        // Manejar errores específicos de autenticación
        if (authError.message.includes("already registered")) {
          toastError("Este email ya está registrado", toastStyle);
        } else if (authError.message.includes("Invalid email")) {
          toastError("El formato del email no es válido", toastStyle);
        } else if (authError.message.includes("Password")) {
          toastError("La contraseña no cumple con los requisitos", toastStyle);
        } else {
          toastError(
            "Error al crear la cuenta: " + authError.message,
            toastStyle
          );
        }

        toast.dismiss("registro");
        setLoading(false);
        return;
      }

      const id = authData.user.id;
      console.log("Usuario registrado en Auth con ID:", id);

      // 2. Subir foto al storage
      toast.loading("Subiendo foto...", { id: "registro" });

      const fileName = `private/${Date.now()}-${selectedFile.name}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("fotos")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.error("Error al subir la foto:", storageError);

        // Manejar errores específicos de storage
        if (storageError.message.includes("size")) {
          toastError("La foto es demasiado grande. Máximo 5MB", toastStyle);
        } else if (storageError.message.includes("format")) {
          toastError(
            "Formato de foto no válido. Usa JPG, PNG o JPEG",
            toastStyle
          );
        } else {
          toastError(
            "Error al subir la foto: " + storageError.message,
            toastStyle
          );
        }

        toast.dismiss("registro");
        setLoading(false);
        return;
      }

      // Generar URL firmada para acceder a la imagen en la carpeta privada
      const { data: publicUrlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Guardar usuario en la tabla
      toast.loading("Guardando datos del usuario...", { id: "registro" });

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .insert([
          {
            id: id, // Utiliza el ID de Supabase Auth
            primer_nombre: data.primer_nombre,
            segundo_nombre: data.segundo_nombre,
            apellido_paterno: data.apellido_paterno,
            apellido_materno: data.apellido_materno,
            email: data.email,
            telefono: data.telefono,
            role: data.role,
            justificacion: data.justificacion,
            foto: imageUrl,
            fecha_creacion: new Date(),
            fecha_modificacion: new Date(),
          },
        ]);

      if (usuarioError) {
        console.error("Error al guardar el usuario:", usuarioError);

        // Manejar errores específicos de base de datos
        if (usuarioError.message.includes("duplicate")) {
          toastError("Ya existe un usuario con este email", toastStyle);
        } else if (usuarioError.message.includes("permission")) {
          toastError("No tienes permisos para crear usuarios", toastStyle);
        } else {
          toastError(
            "Error al guardar los datos: " + usuarioError.message,
            toastStyle
          );
        }

        toast.dismiss("registro");
        setLoading(false);
        return;
      }

      // 4. Éxito completo
      console.log("Usuario creado con éxito:", usuarioData);

      toast.dismiss("registro");
      toastSuccess(
        `✅ Usuario ${data.primer_nombre} ${data.apellido_paterno} registrado exitosamente`,
        toastStyle
      );
      // Redirigir a la página de mostrar usuarios
      router.push("/mostrarUsuarios");
      // Limpiar formulario y estado
      reset();
      setSelectedFile(null);

      // Opcional: mostrar mensaje adicional con instrucciones
      setTimeout(() => {
        toastSuccess(
          "El usuario puede iniciar sesión con su email y contraseña",
          toastStyle
        );
      }, 2000);
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.dismiss("registro");
      toastError("Error inesperado al registrar usuario", toastStyle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-2 md:px-8 xl:px-20 py-8 bg-blue">
      <div className="bg-white flex flex-col w-full max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-7xl rounded-xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/images/escudo-png.png"
            alt="Escudo"
            width={80}
            height={80}
            className="escudo"
            priority
          />
          <h1 className="font-black text-2xl sm:text-3xl text-blue mb-2">
            Registro de Usuarios
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            Completa todos los campos obligatorios{" "}
            <span className="text-yellow-500">*</span>
          </p>
        </div>
        {/* Errores globales */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-3 rounded bg-yellow border-l-4 border-gold text-blue animate-fadeIn">
            Corrige los campos marcados en amarillo.
          </div>
        )}
        <form
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Primer Nombre */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Primer Nombre <span className="text-yellow-500">*</span>
            </label>
            <input
              id="primer_nombre"
              type="text"
              {...register("primer_nombre")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Primer Nombre"
              disabled={loading}
            />
            {errors.primer_nombre && (
              <span className="text-yellow-500 text-xs">
                {errors.primer_nombre.message}
              </span>
            )}
          </div>

          {/* Segundo Nombre */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Segundo Nombre <span className="text-yellow-500">*</span>
            </label>
            <input
              id="segundo_nombre"
              type="text"
              {...register("segundo_nombre")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Segundo Nombre"
              disabled={loading}
            />
            {errors.segundo_nombre && (
              <span className="text-yellow-500 text-xs">
                {errors.segundo_nombre.message}
              </span>
            )}
          </div>

          {/* Apellido Paterno */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Apellido Paterno <span className="text-yellow-500">*</span>
            </label>
            <input
              id="apellido_paterno"
              type="text"
              {...register("apellido_paterno")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Apellido Paterno"
              disabled={loading}
            />
            {errors.apellido_paterno && (
              <span className="text-yellow-500 text-xs">
                {errors.apellido_paterno.message}
              </span>
            )}
          </div>

          {/* Apellido Materno */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Apellido Materno <span className="text-yellow-500">*</span>
            </label>
            <input
              id="apellido_materno"
              type="text"
              {...register("apellido_materno")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Apellido Materno"
              disabled={loading}
            />
            {errors.apellido_materno && (
              <span className="text-yellow-500 text-xs">
                {errors.apellido_materno.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Email <span className="text-yellow-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Email"
              disabled={loading}
            />
            {errors.email && (
              <span className="text-yellow-500 text-xs">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Teléfono
            </label>
            <input
              id="telefono"
              type="text"
              {...register("telefono")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa el Teléfono (Opcional)"
              disabled={loading}
            />
            {errors.telefono && (
              <span className="text-yellow-500 text-xs">
                {errors.telefono.message}
              </span>
            )}
          </div>

          {/* Selección de Rol */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Rol <span className="text-yellow-500">*</span>
            </label>
            <select
              id="role"
              {...register("role")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              disabled={loading}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            {errors.role && (
              <span className="text-yellow-500 text-xs">
                {errors.role.message}
              </span>
            )}
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Justificación <span className="text-yellow-500">*</span>
            </label>
            <textarea
              id="justificacion"
              {...register("justificacion")}
              maxLength={300}
              placeholder="Explica por qué necesitas acceso a la plataforma"
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              disabled={loading}
              rows={4}
            />
            {errors.justificacion && (
              <span className="text-yellow-500 text-xs">
                {errors.justificacion.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Contraseña <span className="text-yellow-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Ingresa una Contraseña"
              disabled={loading}
            />
            {errors.password && (
              <span className="text-yellow-500 text-xs">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirmar Password */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Confirmar Contraseña <span className="text-yellow-500">*</span>
            </label>
            <input
              id="confirmar_password"
              type="password"
              {...register("confirmar_password")}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              placeholder="Confirma la contraseña"
              disabled={loading}
            />
            {errors.confirmar_password && (
              <span className="text-yellow-500 text-xs">
                {errors.confirmar_password.message}
              </span>
            )}
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-blue">
              Foto <span className="text-yellow-500">*</span>
            </label>
            <input
              type="file"
              id="foto"
              onChange={handleFileChange}
              className="border border-yellow focus:border-gold focus:ring-yellow focus:ring-2 focus:outline-none w-full rounded-lg px-3 py-2 text-sm text-blue bg-white"
              accept=".jpg, .jpeg, .png"
              required
              disabled={loading}
            />
            {selectedFile && (
              <span className="text-green-700 text-xs mt-1">
                ✅ Foto seleccionada: {selectedFile.name}
              </span>
            )}
          </div>

          {/* Botón de Registro */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block disabled:opacity-50 disabled:cursor-not-allowed animate-fadeIn"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue mr-2"></div>
                  Registrando...
                </span>
              ) : (
                "Registrar Usuario"
              )}
            </button>
            <p className="text-center mt-4 text-sm text-blue">
              Al hacer clic en &quot;Registrar Usuario&quot;, aceptas nuestros
              Términos de Servicio y Políticas de Privacidad.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
