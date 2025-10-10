// src/components/BookForm.js
"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// ▸ Validaciones básicas
const tituloRegex =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,:;()'"\-–—!?/&]+$/;
// Al menos 1 letra (español incluido)
const TITULO_DEBE_TENER_LETRA = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;

const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

const MAX_EDICIONES = 50; // ajusta al numero que requieran

const MIN_PAGINAS = 4;
const MAX_PAGINAS = 2000;

function isValidISBN(isbn) {
  const digits = isbn.replace(/[-\s]/g, "");
  if (/^\d{9}[\dXx]$/.test(digits)) {
    // ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += (i + 1) * parseInt(digits[i], 10);
    const check = digits[9].toUpperCase();
    sum += check === "X" ? 100 : 10 * parseInt(check, 10);
    return sum % 11 === 0;
  } else if (/^\d{13}$/.test(digits)) {
    // ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++)
      sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(digits[12], 10);
  }
  return false;
}

function calculateISBN13CheckDigit(isbn12) {
  if (!/^\d{12}$/.test(isbn12)) return "";
  let sum = 0;
  for (let i = 0; i < 12; i++)
    sum += parseInt(isbn12[i], 10) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function calculateISBN10CheckDigit(isbn9) {
  if (!/^\d{9}$/.test(isbn9)) return "";
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (i + 1) * parseInt(isbn9[i], 10);
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

const CURRENT_YEAR = new Date().getFullYear();

// ▸ Esquema (SIN depósito legal aquí; PDF del libro sigue siendo opcional)
const RegisterBookSchema = z.object({
  selectedAutorId: z.preprocess((val) => {
    const v = Array.isArray(val) ? val[0] : val;
    return v ? parseInt(v, 10) : NaN;
  }, z.number({ invalid_type_error: "Debes seleccionar un autor" }).int()),
  tipoAutoria: z.enum(["individual", "coautoría", "colectiva"], {
    errorMap: () => ({ message: "Selecciona un tipo de autoría" }),
  }),
  codigoRegistro: z.string().min(2, {
    message: "El código de registro debe tener al menos 2 caracteres.",
  }),
  isbn: z
    .string()
    .min(10, { message: "El ISBN debe tener al menos 10 caracteres." })
    .max(17, { message: "El ISBN no debe exceder los 17 caracteres." })
    .refine((val) => isValidISBN(val), {
      message:
        "El ISBN debe ser válido (ISBN-10 o ISBN-13, con o sin guiones, y con dígito de control correcto).",
    }),
  doi: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().regex(doiRegex, { message: "Formato DOI inválido." }).optional()
  ),
  titulo: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(3, { message: "El título debe tener al menos 3 caracteres." })
      .max(200, { message: "Máximo 200 caracteres." })
      .regex(tituloRegex, { message: "Título con caracteres no permitidos." })
      .refine((s) => TITULO_DEBE_TENER_LETRA.test(s), {
        message: "El título debe contener al menos una letra.",
      })
  ),
  subtitulo: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .max(200, { message: "Máximo 200 caracteres." })
        .regex(tituloRegex, {
          message: "Subtítulo con caracteres no permitidos.",
        })
        .refine((s) => TITULO_DEBE_TENER_LETRA.test(s), {
          message: "El subtítulo debe contener al menos una letra.",
        })
    )
    .optional()
    .or(z.literal("")),

  materia: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(1, { message: "La materia es requerida" })
      .max(100, { message: "Máximo 100 caracteres." })
      .regex(tituloRegex, { message: "Materia con caracteres no permitidos." })
      .refine((s) => TITULO_DEBE_TENER_LETRA.test(s), {
        message: "La materia debe contener al menos una letra.",
      })
  ),

  tematica: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(1, { message: "La temática es requerida" })
      .max(100, { message: "Máximo 100 caracteres." })
      .regex(tituloRegex, { message: "Temática con caracteres no permitidos." })
      .refine((s) => TITULO_DEBE_TENER_LETRA.test(s), {
        message: "La temática debe contener al menos una letra.",
      })
  ),
  coleccion: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .max(100, { message: "Máximo 100 caracteres." })
        .regex(tituloRegex, {
          message: "Colección con caracteres no permitidos.",
        })
        .refine((s) => TITULO_DEBE_TENER_LETRA.test(s), {
          message: "La colección debe contener al menos una letra.",
        })
    )
    .optional(),

  numeroEdicion: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: "Ingresa un número válido." })
      .int({ message: "Debe ser un número entero." })
      .min(1, { message: "La edición mínima es 1." })
      .max(MAX_EDICIONES, { message: `La edición máxima es ${MAX_EDICIONES}.` })
  ),
  anioPublicacion: z.preprocess((v) => {
    const s = typeof v === "string" ? v.trim() : v;
    return typeof s === "string" && s !== "" ? Number(s) : Number(s);
  }, z.number().int().min(1000).max(CURRENT_YEAR)),
  formato: z.string().min(1, { message: "El formato es requerido" }),
  campus: z.string().optional().or(z.literal("")),
  numeroPaginas: z.preprocess(
    (val) => Number(val),
    z
      .number({ invalid_type_error: "Ingresa un número válido." })
      .int({ message: "Debe ser un número entero." })
      .min(MIN_PAGINAS, { message: `El mínimo es ${MIN_PAGINAS} páginas.` })
      .max(MAX_PAGINAS, { message: `El máximo es ${MAX_PAGINAS} páginas.` })
  ),
  tiraje_o_ibd: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string()
    )
    .optional(),
  idioma: z.enum(
    ["español", "ingles", "frances", "aleman", "portugues", "otro"],
    {
      errorMap: () => ({ message: "Selecciona un idioma válido" }),
    }
  ),
  esTraduccion: z.boolean(),
  sinopsis: z.string().min(1).max(500),
});

export default function BookForm() {
  const [selectedFile, setSelectedFile] = useState(null); // portada (opcional/req según tu UI)
  const [selectedPDF, setSelectedPDF] = useState(null); // PDF del libro (OPCIONAL)
  const [autoresOptions, setAutoresOptions] = useState([]);
  const [isbnInput, setIsbnInput] = useState("");
  const [isbnExists, setIsbnExists] = useState(false);
  const [checkingISBN, setCheckingISBN] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(RegisterBookSchema),
    defaultValues: {
      isbn: "",
      tipoAutoria: "",
      formato: "",
      idioma: "",
    },
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  // Mantener ISBN como campo controlado
  useEffect(() => {
    setValue("isbn", isbnInput, { shouldValidate: true });
  }, [isbnInput, setValue]);

  const handleIsbnChange = (e) => {
    const value = e.target.value.replace(/[^0-9Xx\-]/g, "").slice(0, 17);
    setIsbnInput(value);
    setIsbnExists(false);
  };

  const handleCalculateCheckDigit = async () => {
    const raw = isbnInput.replace(/-/g, "").toUpperCase();
    let fullISBN = "";

    if (/^\d{9}$/.test(raw)) fullISBN = raw + calculateISBN10CheckDigit(raw);
    else if (/^\d{12}$/.test(raw))
      fullISBN = raw + calculateISBN13CheckDigit(raw);
    else if (
      /^\d{10}$/.test(raw) ||
      /^\d{9}X$/.test(raw) ||
      /^\d{13}$/.test(raw)
    )
      fullISBN = raw;
    else {
      toastError(
        "Ingresa 9 (ISBN-10) o 12 (ISBN-13) dígitos sin dígito de control para calcular."
      );
      return;
    }

    if (!isValidISBN(fullISBN)) {
      toastError("El ISBN calculado no es válido.");
      return;
    }

    setCheckingISBN(true);
    setIsbnExists(false);

    const { data, error } = await supabase
      .from("libros")
      .select("isbn")
      .eq("isbn", fullISBN)
      .limit(1);

    setCheckingISBN(false);

    if (error) {
      console.error(error);
      toastError("Error al verificar el ISBN.");
      return;
    }
    if (data && data.length > 0) {
      setIsbnExists(true);
      toastError("El ISBN ya existe en la base de datos.");
      return;
    }

    setIsbnExists(false);
    setIsbnInput(fullISBN);
    toastSuccess("ISBN válido y no duplicado. Dígito de control añadido.");
  };

  const tipoAutoria = watch("tipoAutoria");
  const [coautores, setCoautores] = useState([]);

  useEffect(() => {
    supabase
      .from("autores")
      .select("id, nombre_completo, dependencia_id, unidad_academica_id")
      .then(({ data, error }) => {
        if (!error) setAutoresOptions(data || []);
      });
  }, []);

  const addCoautor = () => setCoautores((arr) => [...arr, ""]);
  const removeCoautor = (idx) =>
    setCoautores((arr) => arr.filter((_, i) => i !== idx));
  const updateCoautor = (idx, val) =>
    setCoautores((arr) => {
      const copy = [...arr];
      copy[idx] = val;
      return copy;
    });

  const handleFileChange = (e) => setSelectedFile(e.target.files?.[0] || null);
  const handlePDFChange = (e) => setSelectedPDF(e.target.files?.[0] || null);

  const onSubmit = async (data) => {
    // 0) Usuario
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      toastError("Debes iniciar sesión para registrar un libro.");
      return;
    }
    const usuarioId = user.id;

    // 1) Subidas
    let imageUrl = "";
    let pdfUrl = "";

    // Portada (opcional o requerido, según tu UI)
    if (selectedFile) {
      const name = `portadas/${Date.now()}-${selectedFile.name}`;
      const { error: upErr1 } = await supabase.storage
        .from("portadas")
        .upload(name, selectedFile, { cacheControl: "3600", upsert: false });
      if (upErr1) {
        console.error(upErr1);
        toastError("Error al subir la portada.");
        return;
      }
      imageUrl = supabase.storage.from("portadas").getPublicUrl(name)
        .data.publicUrl;
    }

    // PDF del libro (OPCIONAL)
    if (selectedPDF) {
      const name = `libros/${Date.now()}-${selectedPDF.name}`;
      const { error: upErr2 } = await supabase.storage
        .from("libros")
        .upload(name, selectedPDF, { cacheControl: "3600", upsert: false });
      if (upErr2) {
        console.error(upErr2);
        toastError("Error al subir el PDF del libro.");
        return;
      }
      pdfUrl = supabase.storage.from("libros").getPublicUrl(name)
        .data.publicUrl;
    }

    // 2) Autor principal
    const { selectedAutorId, ...libroFields } = data;
    if (!selectedAutorId) {
      toastError("Debes seleccionar un autor.");
      return;
    }
    const autor = autoresOptions.find((a) => a.id === selectedAutorId);
    if (!autor) {
      toastError("Autor no válido.");
      return;
    }

    // 3) Insert en libros (sin tocar depósito legal aquí)
    const { data: nuevoLibro, error: errLibro } = await supabase
      .from("libros")
      .insert([
        {
          ...libroFields, // incluye: codigoRegistro, isbn, doi, titulo, etc.
          idioma: libroFields.idioma,
          user_id: usuarioId,
          dependencia_id: autor.dependencia_id,
          unidad_academica_id: autor.unidad_academica_id,
          portada: imageUrl || null,
          archivo_pdf: pdfUrl || null, // <- OPCIONAL
        },
      ])
      .select("id_libro")
      .single();

    if (errLibro) {
      console.error(errLibro);
      toastError("No se pudo registrar el libro.");
      return;
    }

    // 4) Relacionar autor(es)
    const relaciones = [
      {
        libro_id: nuevoLibro.id_libro,
        autor_id: selectedAutorId,
        tipo_autor: "autor",
      },
    ];
    if (tipoAutoria !== "individual") {
      coautores.forEach((coId) => {
        if (coId) {
          relaciones.push({
            libro_id: nuevoLibro.id_libro,
            autor_id: parseInt(coId, 10),
            tipo_autor: "coautor",
          });
        }
      });
    }

    const { error: errLA } = await supabase
      .from("libro_autor")
      .insert(relaciones);
    if (errLA) {
      console.error(errLA);
      toastError("Libro registrado, pero no se pudo vincular autor.");
      return;
    }

    toastSuccess("Libro y autor relacionados correctamente");
    reset();
    setSelectedFile(null);
    setSelectedPDF(null);
    setIsbnInput("");
    setIsbnExists(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
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
            <h1 className="font-black text-3xl mb-5 text-blue">
              Registro de Libros
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Autor principal */}
            <div className="mb-4 col-span-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Selecciona Autor Principal*
              </label>
              <select
                {...register("selectedAutorId")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="">— Selecciona un autor —</option>
                {autoresOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.nombre_completo}
                  </option>
                ))}
              </select>
              {errors.selectedAutorId && (
                <p className="text-red-500 text-xs">
                  {errors.selectedAutorId.message}
                </p>
              )}
            </div>

            {/* Tipo autoría */}
            <div className="mb-4">
              <label
                htmlFor="tipoAutoria"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tipo Autoría*
              </label>
              <select
                id="tipoAutoria"
                {...register("tipoAutoria")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="" disabled>
                  Selecciona un tipo de autoría
                </option>
                <option value="individual">Individual</option>
                <option value="coautoría">Coautoría</option>
                <option value="colectiva">Colectiva</option>
              </select>
              {errors.tipoAutoria && (
                <p className="text-red-500 text-xs">
                  {errors.tipoAutoria.message}
                </p>
              )}
            </div>

            {/* Coautores */}
            {(tipoAutoria === "coautoría" || tipoAutoria === "colectiva") && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Coautores
                </label>
                {coautores.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <select
                      value={c}
                      onChange={(e) => updateCoautor(i, e.target.value)}
                      className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                    >
                      <option value="">— Selecciona coautor —</option>
                      {autoresOptions.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre_completo}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCoautor(i)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCoautor}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm mt-2"
                >
                  Añadir coautor
                </button>
              </div>
            )}

            {/* Campos del libro */}
            <div className="mb-4">
              <label
                htmlFor="codigoRegistro"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Código Registro*
              </label>
              <input
                type="text"
                id="codigoRegistro"
                {...register("codigoRegistro")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.codigoRegistro && (
                <p className="text-red-500 text-xs">
                  {errors.codigoRegistro.message}
                </p>
              )}
            </div>

            {/* ISBN controlado */}
            <div className="mb-4 flex flex-col">
              <label
                htmlFor="isbn"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ISBN*
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  id="isbn"
                  {...register("isbn")}
                  value={isbnInput}
                  onChange={handleIsbnChange}
                  placeholder="Escribe 9 o 12 dígitos y presiona calcular"
                  maxLength={17}
                  autoComplete="off"
                  required
                  className={`flex-grow rounded-lg px-3 py-2 text-sm text-blue focus:outline-none focus:ring-2 w-full ${
                    isbnExists
                      ? "border-red-500 focus:border-red-500 focus:ring-red-400"
                      : "border-yellow focus:border-blue focus:ring-gold border"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCalculateCheckDigit}
                  disabled={checkingISBN}
                  className="inline-flex items-center bg-blue text-white font-medium px-3 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  {checkingISBN ? "Verificando..." : "Calcular"}
                </button>
              </div>
              {touchedFields.isbn && errors.isbn && (
                <p className="text-red-500 text-xs mt-1">
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
                {...register("doi")}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ej. 10.1000/xyz123 (opcional)"
              />
              {errors.doi && (
                <p className="text-red-500 text-xs">{errors.doi.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="titulo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Título*
              </label>
              <input
                type="text"
                id="titulo"
                placeholder="Escribe el título del libro"
                {...register("titulo")}
                required
                pattern=".*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ].*"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.titulo && (
                <p className="text-red-500 text-xs">{errors.titulo.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="subtitulo"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Subtítulo
              </label>
              <input
                type="text"
                id="subtitulo"
                {...register("subtitulo")}
                pattern=".*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ].*"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Opcional"
              />

              {errors.subtitulo && (
                <p className="text-red-500 text-xs">
                  {errors.subtitulo.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="materia"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Materia*
              </label>
              <input
                type="text"
                id="materia"
                placeholder="Ej. Historia"
                {...register("materia")}
                required
                pattern=".*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ].*"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />

              {errors.materia && (
                <p className="text-red-500 text-xs">{errors.materia.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="tematica"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Temática*
              </label>
              <input
                type="text"
                id="tematica"
                placeholder="Ej. Historia de latinoamerica"
                {...register("tematica")}
                required
                pattern=".*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ].*"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />

              {errors.tematica && (
                <p className="text-red-500 text-xs">
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
                {...register("coleccion")}
                placeholder="Opcional"
                // vacío o contiene alguna letra
                pattern="(^$|.*[A-Za-zÁÉÍÓÚÜÑáéíóúüñ].*)"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />

              {errors.coleccion && (
                <p className="text-red-500 text-xs">
                  {errors.coleccion.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="numeroEdicion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Número de Edición*
              </label>
              <input
                type="number"
                id="numeroEdicion"
                {...register("numeroEdicion")}
                required
                min={1}
                max={MAX_EDICIONES}
                step={1}
                placeholder={`1–${MAX_EDICIONES}`}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />

              {errors.numeroEdicion && (
                <p className="text-red-500 text-xs">
                  {errors.numeroEdicion.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="anioPublicacion"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Año de Publicación*
              </label>
              <input
                type="text"
                id="anioPublicacion"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                {...register("anioPublicacion")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ejemplo: 1980"
                autoComplete="off"
              />
              {errors.anioPublicacion && (
                <p className="text-red-500 text-xs">
                  {errors.anioPublicacion.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="formato"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Formato*
              </label>
              <select
                id="formato"
                {...register("formato")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="" disabled>
                  Selecciona un formato de impresión
                </option>
                <option value="impreso">Impreso</option>
                <option value="Impresión bajo demanda">IBD</option>
                <option value="Electrónico de acceso abierto">EA</option>
                <option value="Electrónico comercial">EC</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.formato && (
                <p className="text-red-500 text-xs">{errors.formato.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="numeroPaginas"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Número de Páginas*
              </label>
              <input
                type="number"
                id="numeroPaginas"
                {...register("numeroPaginas")}
                required
                min={MIN_PAGINAS}
                max={MAX_PAGINAS}
                step={1}
                placeholder={`${MIN_PAGINAS}–${MAX_PAGINAS}`}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />

              {errors.numeroPaginas && (
                <p className="text-red-500 text-xs">
                  {errors.numeroPaginas.message}
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
                placeholder="Opcional"
                {...register("tiraje_o_ibd", {
                  setValueAs: (v) =>
                    typeof v === "string" && v.trim() === "" ? undefined : v,
                })}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              />
              {errors.tiraje_o_ibd && (
                <p className="text-red-500 text-xs">
                  {errors.tiraje_o_ibd.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="idioma"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Idioma*
              </label>
              <select
                id="idioma"
                {...register("idioma")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="">— Selecciona un idioma —</option>
                <option value="español">Español</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="aleman">Alemán</option>
                <option value="portugues">Portugués</option>
                <option value="otro">Otro</option>
              </select>
              {errors.idioma && (
                <p className="text-red-500 text-xs">{errors.idioma.message}</p>
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
                  {...register("esTraduccion")}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Es Traducción al Español</span>
              </label>
            </div>

            <div className="mb-4 col-span-full">
              <label
                htmlFor="sinopsis"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Sinopsis*
              </label>
              <textarea
                id="sinopsis"
                {...register("sinopsis")}
                required
                rows={4}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa la sinopsis del libro (máximo 500 caracteres)"
              />
              {errors.sinopsis && (
                <p className="text-red-500 text-xs">
                  {errors.sinopsis.message}
                </p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Caracteres restantes: {500 - (watch("sinopsis")?.length || 0)}
              </div>
            </div>

            {/* Portada (puedes dejarla requerida si así estaba) */}
            <div className="mb-4">
              <label
                htmlFor="portada"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Portada*
              </label>
              <input
                type="file"
                id="portada"
                onChange={handleFileChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".jpg,.jpeg,.png"
                required
              />
            </div>

            {/* PDF del libro — OPCIONAL */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo Libro PDF (opcional)
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
            </div>

            <div className="col-span-full">
              <button
                type="submit"
                className="transition duration-200 bg-yellow text-blue hover:bg-blue hover:text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                Registrar Libro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
