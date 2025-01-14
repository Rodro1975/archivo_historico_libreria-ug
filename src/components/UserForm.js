"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import supabase from "@/lib/supabase";

const RegisterUserSchema = z.object({
  primer_nombre: z
    .string()
    .min(2, { message: "El primer nombre es requerido" }),
  segundo_nombre: z.string().default(""),
  apellido_paterno: z
    .string()
    .min(2, { message: "El apellido paterno es requerido" }),
  apellido_materno: z.string().default(""),
  email: z
    .string()
    .min(1, { message: "El email es requerido" })
    .email({ message: "Formato de email no válido" }),
  telefono: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "El teléfono debe tener 10 dígitos." })
    .optional(),
  justificacion: z
    .string()
    .min(1, { message: "La justificación es requerida" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .max(20, { message: "La contraseña no puede exceder 20 caracteres." })
    .regex(/[A-Z]/, { message: "Debe contener al menos una letra mayúscula." })
    .regex(/[a-z]/, { message: "Debe contener al menos una letra minúscula." })
    .regex(/[0-9]/, { message: "Debe contener al menos un número." })
    .regex(/[!@#$%^&*]/, {
      message: "Debe contener al menos un carácter especial.",
    }),
  role: z.string().min(1, { message: "El rol es requerido" }),
  foto: z
    .string()
    .url({ message: "Formato de URL no válido" })
    .min(1, { message: "La URL de la foto es requerida" }),
});

export default function UserForm() {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterUserSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Elimina id_auth si existe en los datos
      const { id_auth, ...userData } = data; // Asegúrate de no enviar id_auth

      const { error } = await supabase.from("usuarios").insert([userData]); // Inserta solo los datos necesarios

      if (error) {
        console.error("Error al insertar datos:", error.message);
        setSuccessMessage("");
      } else {
        console.log("Datos insertados:", userData);
        setSuccessMessage("Datos registrados correctamente.");
        reset();
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
    }
  };

  return (
    <div className="container ml-auto mr-auto flex flex-wrap items-start mt-8 items-center justify-center">
      <div className="container mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
        <h1 className="text-3xl text-blue font-extrabold text-center mb-6">
          Registrar un nuevo Usuario
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white px-8 pt-6 pb-8 mb-4 text-blue grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Aquí puedes agregar todos los campos del formulario */}
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
              {...register("primer_nombre")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Primer Nombre"
            />
            {errors.primer_nombre && ( // Muestra el mensaje de error si existe
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
              {...register("segundo_nombre")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Segundo Nombre"
            />
            {errors.segundo_nombre && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.segundo_nombre.message}
              </p>
            )}
          </div>

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
              {...register("apellido_paterno")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Apellido Paterno"
            />
            {errors.apellido_paterno && ( // Muestra el mensaje de error si existe
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
              {...register("apellido_materno")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Apellido Materno"
            />
            {errors.apellido_materno && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.apellido_materno.message}
              </p>
            )}
          </div>

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
              {...register("email")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Email"
            />
            {errors.email && ( // Muestra el mensaje de error si existe
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
              {...register("telefono")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Teléfono"
            />
            {errors.telefono && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.telefono.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="justificacion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Justificación
            </label>
            <input
              type="text"
              id="justificacion"
              {...register("justificacion")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa la Justificación"
            />
            {errors.justificacion && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.justificacion.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el password"
            />
            {errors.password && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Rol
            </label>
            <select
              id="role"
              {...register("role")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>
                Selecciona un rol
              </option>
              <option value="Administrador">Administrador</option>
              <option value="Editor">Editor</option>
              <option value="Lector">Lector</option>
            </select>
            {errors.role && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.role.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="foto"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Foto
            </label>
            <input
              type="text"
              id="foto"
              {...register("foto")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa la URL de la foto"
            />
            {errors.foto && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.foto.message}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-auto h-12"
            >
              Registrar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
