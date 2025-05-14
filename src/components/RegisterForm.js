"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";

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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmit = async (data) => {
    console.log("Datos enviados:", data);

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error("Error al registrar en Auth:", authError);
      return;
    }

    const id = authData.user.id;
    console.log("Usuario registrado en Auth con ID:", id);

    //logica para el almacenamiento de la foto
    if (!selectedFile) {
      console.error("No se seleccionó ninguna foto.");
      return;
    }

    const fileName = `private/${Date.now()}-${selectedFile.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("fotos")
      .upload(fileName, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      console.error("Error al subir la foto:", storageError);
      return;
    }

    // Generar URL firmada para acceder a la imagen en la carpeta privada
    const { data: publicUrlData } = supabase.storage
      .from("fotos")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    //consulta a Supabase
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
      return;
    }

    console.log("Usuario creado con éxito:", usuarioData);
    reset(); //limpiar formulario
    setSelectedFile(null); //limpiar el estado de la foto
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
      {/* formulario de registro */}
      <div className="bg-gray-100 flex flex-col sm:py-12 md:w-full md:max-w-4xl rounded-lg shadow-lg">
        <div className="p-10 xs:p-0 mx-auto w-full">
          <div className="px-5 py-7 text-center">
            <div className="flex justify-center mb-5">
              <Image
                src="/images/escudo-png.png"
                alt="Escudo"
                className="h-20"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="font-black text-3xl mb-5 text-gold">
              Registro de Usuarios
            </h1>
          </div>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Campos de Nombre */}
            <div className="mb-4">
              <label
                htmlFor="primer_nombre"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Primer Nombre
              </label>
              <input
                type="text"
                id="primer_nombre"
                {...register("primer_nombre", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Primer Nombre"
              />
              {errors.primer_nombre && (
                <p className="text-red-500 text-xs italic">
                  {errors.primer_nombre.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="segundo_nombre"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Segundo Nombre
              </label>
              <input
                type="text"
                id="segundo_nombre"
                {...register("segundo_nombre", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Segundo Nombre"
              />
              {errors.segundo_nombre && (
                <p className="text-red-500 text-xs italic">
                  {errors.segundo_nombre.message}
                </p>
              )}
            </div>

            {/* Campos de Apellido */}
            <div className="mb-4">
              <label
                htmlFor="apellido_paterno"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Apellido Paterno
              </label>
              <input
                type="text"
                id="apellido_paterno"
                {...register("apellido_paterno", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Apellido Paterno"
              />
              {errors.apellido_paterno && (
                <p className="text-red-500 text-xs italic">
                  {errors.apellido_paterno.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="apellido_materno"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Apellido Materno
              </label>
              <input
                type="text"
                id="apellido_materno"
                {...register("apellido_materno", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Apellido Materno"
              />
              {errors.apellido_materno && (
                <p className="text-red-500 text-xs italic">
                  {errors.apellido_materno.message}
                </p>
              )}
            </div>

            {/* Campos de Datos */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Este campo es obligatorio",
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs italic">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="telefono"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Teléfono
              </label>
              <input
                type="text"
                id="telefono"
                {...register("telefono", {})}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa el Teléfono (Opcional)"
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs italic">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            {/* Selección de Rol */}
            <div className="mb-4 col-span-full">
              <label
                htmlFor="role"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Rol
              </label>
              <select
                id="role"
                {...register("role", { required: "Este campo es obligatorio" })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="">Selecciona un rol</option>
                {roles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs italic">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Justificación */}
            <div className="mb-4 col-span-full">
              <textarea
                id="justificacion"
                {...register("justificacion", {
                  required: "Este campo es obligatorio",
                })}
                maxLength={300}
                placeholder="Justificación"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.justificacion && (
                <span className="text-red-600">
                  {errors.justificacion.message}
                </span>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Password
              </label>
              <input
                {...register("password", {
                  required: "Este campo es obligatorio",
                })}
                type="password"
                id="password"
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa una Contraseña"
              />
            </div>

            <div>
              <label
                htmlFor="confirmar_password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmar_password"
                {...register("confirmar_password")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Confirma la contraseña"
              />
              {errors.confirmar_password && (
                <p className="text-red-500 text-xs italic">
                  {errors.confirmar_password.message}
                </p>
              )}
            </div>

            {/* Campo para seleccionar la foto */}
            <div className="mb-4">
              <label
                htmlFor="foto"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Foto
              </label>
              <input
                type="file"
                id="foto"
                onChange={handleFileChange} // Se cambia a manejar el archivo directamente
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".jpg, .jpeg, .png"
              />
            </div>

            {/* Botón de Registro */}
            <div className="col-span-full">
              <button
                type="submit"
                className="transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                Registrar Usuario
              </button>
              <p className="text-center mt-4 text-sm text-blue">
                Al hacer clic en &quot;Registrar Usuario&quot;, aceptas nuestros
                Términos de Servicio y Políticas de Privacidad.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
