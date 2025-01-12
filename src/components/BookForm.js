"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import supabase from "@/lib/supabase";

// Esquema de validación con Zod
const RegisterBookSchema = z.object({
  codigoRegistro: z.string().min(2, {
    message: "El código de registro debe tener al menos 2 caracteres.",
  }),
  isbn: z
    .string()
    .min(2, { message: "El ISBN debe tener al menos 2 caracteres." }),
  doi: z
    .string()
    .min(2, { message: "El DOI debe tener al menos 2 caracteres." }),
  titulo: z.string().min(1, { message: "El título es requerido" }),
  subtitulo: z.string().optional(),
  materia: z.string().optional(),
  tematica: z.string().optional(),
  coleccion: z.string().min(1, { message: "La colección es requerida" }),
  numeroEdicion: z
    .number()
    .int({ message: "El número de edición debe ser un entero." }),
  anioPublicacion: z
    .string()
    .min(1, { message: "La fecha de publicación es requerida." }),
  formato: z.string().min(1, { message: "El formato es requerido" }),
  responsablePublicacion: z.string().optional(),
  correoResponsable: z.string().optional(),
  telefonoResponsable: z.string().optional(),
  campus: z.string().min(1, { message: "El campus es requerido" }),
  division: z.string().optional(),
  departamento: z.string().optional(),
  tipoAutoria: z.string().optional(),
  dimensiones: z
    .string()
    .min(2, { message: "Las dimensiones deben tener al menos 2 caracteres." }),
  numeroPaginas: z
    .number()
    .int({ message: "El número de páginas debe ser un entero." }),
  pesoGramos: z
    .number()
    .int({ message: "El peso en gramos debe ser un entero." }),
  tiraje_o_ibd: z.string().min(1, { message: "El tiraje es requerido" }),
  esTraduccion: z.boolean(),
  sinopsis: z.string().min(1, { message: "La sinopsis es requerida" }),
  depositoLegal: z.boolean(),
  portada: z.string().min(1, { message: "La portada es requerida" }),
  archivo_pdf: z.string().min(1, { message: "El documento PDF es requerido" }),
  depositoLegal_pdf: z.string().optional(),
});

export default function BookForm() {
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit, // Corrige aquí el nombre de la función
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterBookSchema),
  });

  const onSubmit = async (data) => {
    console.log("Datos antes de enviar:", data);

    // Sanitizar datos antes de enviar a Supabase
    const sanitizedData = {
      ...data,
    };

    console.log("Sanitized data before sending:", sanitizedData);

    // Enviar los datos a Supabase
    const { data: insertDataResponse, error } = await supabase
      .from("libros")
      .insert([sanitizedData]);

    if (error) {
      console.error("Error al insertar datos:", error);
      setSuccessMessage("");
    } else {
      console.log("Datos insertados:", insertDataResponse);
      setSuccessMessage("Datos registrados correctamente.");
      reset();
    }
  };

  return (
    <div className="container ml-auto mr-auto flex flex-wrap items-start mt-8 items-center justify-center">
      <div className="container mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
        <h1 className="text-3xl text-blue font-extrabold text-center mb-6">
          Registrar un nuevo libro
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white px-8 pt-6 pb-8 mb-4 text-blue grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Aquí puedes agregar todos los campos del formulario */}
          <div className="mb-4">
            <label
              htmlFor="codigoRegistro"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Código Registro
            </label>
            <input
              type="text"
              id="codigoRegistro"
              {...register("codigoRegistro")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu código de registro"
            />
            {errors.codigoRegistro && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.codigoRegistro.message}
              </p>
            )}
          </div>

          {/* Repetir este bloque para cada campo */}
          <div className="mb-4">
            <label
              htmlFor="isbn"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              {...register("isbn")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu ISBN"
            />
            {errors.isbn && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.isbn.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="doi"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              DOI
            </label>
            <input
              type="text"
              id="doi"
              {...register("doi")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu DOI"
            />
            {errors.doi && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.doi.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="titulo"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Titulo
            </label>
            <input
              type="text"
              id="titulo"
              {...register("titulo")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Titulo"
            />
            {errors.titulo && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="subtitulo"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Subtitulo
            </label>
            <input
              type="text"
              id="subtitulo"
              {...register("subtitulo")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Subtitulo"
            />
            {errors.subtitulo && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.subtitulo.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="materia"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Materia
            </label>
            <input
              type="text"
              id="materia"
              {...register("materia")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Materia"
            />
            {errors.materia && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.materia.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="tematica"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tematica
            </label>
            <input
              type="text"
              id="tematica"
              {...register("tematica")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Tematica"
            />
            {errors.tematica && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.tematica.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="coleccion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Colección
            </label>
            <input
              type="text"
              id="coleccion"
              {...register("coleccion")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Colección"
            />
            {errors.coleccion && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.coleccion.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="numeroEdicion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Número de Edicion
            </label>
            <input
              type="number"
              id="numeroEdicion"
              {...register("numeroEdicion")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa tu Número de Edición"
            />
            {errors.numeroEdicion && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.numeroEdicion.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="anioPublicacion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Año de Publicación
            </label>
            <input
              type="number"
              id="anioPublicacion"
              {...register("anioPublicacion")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Año de Publicación"
            />
            {errors.anioPublicacion && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.anioPublicacion.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="formato"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Formato
            </label>
            <select
              id="formato"
              {...register("formato")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>
                Selecciona un formato de impresión
              </option>
              <option value="impreso">Impreso</option>
              <option value="electronico">Electrónico</option>
              <option value="ambos">Ambos</option>
            </select>
            {errors.formato && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.formato.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="responsablePublicacion"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Responsable de Publicación
            </label>
            <input
              type="text"
              id="responsablePublicacion"
              {...register("responsablePublicacion")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa al responsable de la publicación"
            />
            {errors.responsablePublicacion && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.responsablePublicacion.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="correoResponsable"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Correo del Responsable de Publicación
            </label>
            <input
              type="email"
              id="correoResponsable"
              {...register("correoResponsable")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el correo del responsable de la publicación"
            />
            {errors.correoResponsable && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.correoResponsable.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="telefonoResponsable"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Teléfono del Responsable de Publicación
            </label>
            <input
              type="text"
              id="telefonoResponsable"
              {...register("telefonoResponsable")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el teléfono del responsable de la publicación"
            />
            {errors.telefonoResponsable && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.telefonoResponsable.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="campus"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Campus
            </label>
            <input
              type="text"
              id="campus"
              {...register("campus")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Campus"
            />
            {errors.campus && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.campus.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="division"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              División
            </label>
            <input
              type="text"
              id="division"
              {...register("division")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa la División"
            />
            {errors.division && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.division.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="departamento"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Departamento
            </label>
            <input
              type="text"
              id="departamento"
              {...register("departamento")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Departamento"
            />
            {errors.departamento && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.departamento.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="tipoAutoria"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tipo Autoría
            </label>
            <select
              id="tipoAutoria"
              {...register("tipoAutoria")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="" disabled>
                Selecciona un tipo de autoría
              </option>
              <option value="individual">Individual</option>
              <option value="coautoría">Coautoría</option>
              <option value="colectiva">Colectiva</option>
            </select>
            {errors.tipoAutoria && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.tipoAutoria.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="dimensiones"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Dimensiones
            </label>
            <input
              type="text"
              id="dimensiones"
              {...register("dimensiones")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa las Dimensiones"
            />
            {errors.dimensiones && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.dimensiones.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="numeroPaginas"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Número de Páginas
            </label>
            <input
              type="number"
              id="numeroPaginas"
              {...register("numeroPaginas")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Número de Páginas"
            />
            {errors.numeroPaginas && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.numeroPaginas.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="idioma"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Idioma
            </label>
            <input
              type="text"
              id="idioma"
              {...register("idioma")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Idioma"
            />
            {errors.idioma && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.idioma.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="pesoGramos"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Peso en Gramos
            </label>
            <input
              type="number"
              id="pesoGramos"
              {...register("pesoGramos")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Peso en Gramos"
            />
            {errors.pesoGramos && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.pesoGramos.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="tiraje_o_ibd"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tiraje o IBD
            </label>
            <input
              type="text"
              id="tiraje_o_ibd"
              {...register("tiraje_o_ibd")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa el Tiraje o IBD"
            />
            {errors.tiraje_o_ibd && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.tiraje_o_ibd.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="esTraduccion"
              className="inline-flex items-center text-gray-700 text-sm font-bold"
            >
              <input
                type="checkbox"
                id="esTraduccion"
                {...register("esTraduccion")} // Registra el campo con react-hook-form
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Es Traducción al Español</span>
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="sinopsis"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Sinopsis
            </label>
            <input
              type="text"
              id="sinopsis"
              {...register("sinopsis")} // Registra el campo con react-hook-form
              required
              className="input-field shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Ingresa la Sinopsis"
            />
            {errors.sinopsis && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.sinopsis.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="depositoLegal"
              className="inline-flex items-center text-gray-700 text-sm font-bold"
            >
              <input
                type="checkbox"
                id="depositoLegal"
                {...register("depositoLegal")} // Registra el campo con react-hook-form
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Tiene Deposito Legal</span>
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="portada"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              URL de la Portada
            </label>
            <input
              type="text"
              id="portada"
              {...register("portada")} // Registra el campo con react-hook-form
              required
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ingresa la URL de la portada"
            />
            {errors.portada && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.portada.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="archivo_pdf"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              URL del Archivo PDF
            </label>
            <input
              type="text"
              id="archivo_pdf"
              {...register("archivo_pdf")} // Registra el campo con react-hook-form
              required
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ingresa la URL del Archivo PDF"
            />
            {errors.archivo_pdf && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.archivo_pdf.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="depositoLegal_pdf"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              URL del Archivo Deposito Legal PDF
            </label>
            <input
              type="text"
              id="depositoLegal_pdf"
              {...register("depositoLegal_pdf")} // Registra el campo con react-hook-form
              required
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Ingresa la URL del Archivo Deposito Legal PDF"
            />
            {errors.depositoLegal_pdf && ( // Muestra el mensaje de error si existe
              <p className="text-red-500 text-xs italic">
                {errors.depositoLegal_pdf.message}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline w-auto h-12"
            >
              Registrar Libro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
