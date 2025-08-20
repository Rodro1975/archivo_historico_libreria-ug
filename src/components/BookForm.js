"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// Permite letras (incluye acentos), números, espacios y puntuación común.
// NO permite que empiece vacío/espacios, ni que sea solo símbolos.
const tituloRegex =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s.,:;()'"\-–—!?/&]+$/;

// Funciones de validación y cálculo ISBN
function isValidISBN(isbn) {
  const digits = isbn.replace(/[-\s]/g, "");
  if (/^\d{9}[\dXx]$/.test(digits)) {
    // ISBN-10
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (i + 1) * parseInt(digits[i], 10);
    }
    let check = digits[9].toUpperCase();
    sum += check === "X" ? 10 * 10 : 10 * parseInt(check, 10);
    return sum % 11 === 0;
  } else if (/^\d{13}$/.test(digits)) {
    // ISBN-13
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(digits[12], 10);
  }
  return false;
}

function calculateISBN13CheckDigit(isbn12) {
  if (!/^\d{12}$/.test(isbn12)) return "";
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn12[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  return String((10 - (sum % 10)) % 10);
}

function calculateISBN10CheckDigit(isbn9) {
  if (!/^\d{9}$/.test(isbn9)) return "";
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += (i + 1) * parseInt(isbn9[i], 10);
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

// Esquema de validación con Zod
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
        "El ISBN debe ser válido (ISBN-10 o ISBN-13, con o sin guiones, y con dígito de control correcto). Ejemplo: 978-607-441-616-9 o 84-376-0494-1",
    }),
  doi: z.string().regex(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, {
    message: "El DOI debe tener el formato correcto (ej. 10.1000/xyz123).",
  }),
  titulo: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z
      .string()
      .min(3, { message: "El título debe tener al menos 3 caracteres." })
      .max(200, { message: "El título no debe exceder los 200 caracteres." })
      .regex(tituloRegex, {
        message:
          "El título solo puede contener letras, números, espacios y puntuación común, y no puede iniciar con símbolos.",
      })
  ),
  subtitulo: z
    .preprocess(
      (v) => (typeof v === "string" ? v.trim() : v),
      z
        .string()
        .max(200, {
          message: "El subtítulo no debe exceder los 200 caracteres.",
        })
        .regex(tituloRegex, {
          message:
            "El subtítulo solo puede contener letras, números, espacios y puntuación común, y no puede iniciar con símbolos.",
        })
    )
    .optional()
    .or(z.literal("")),
  materia: z.string().optional(),
  tematica: z.string().optional(),
  coleccion: z.string().min(1, { message: "La colección es requerida" }),
  numeroEdicion: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int({ message: "El número de edición debe ser un entero." })
  ),
  anioPublicacion: z
    .string()
    .regex(/^\d{4}$/, {
      message: "El año debe tener exactamente 4 dígitos (ejemplo: 1980)",
    })
    .refine(
      (val) => {
        const num = Number(val);
        return num >= 1000 && num <= new Date().getFullYear();
      },
      {
        message: "El año debe ser válido y de 4 dígitos (ejemplo: 1980)",
      }
    ),
  formato: z.string().min(1, { message: "El formato es requerido" }),
  responsablePublicacion: z.string().optional(),
  correoResponsable: z.string().optional(),
  telefonoResponsable: z.string().optional(),
  campus: z.string().min(1, { message: "El campus es requerido" }),
  division: z.string().optional(),
  departamento: z.string().optional(),
  dimensiones: z
    .string()
    .min(2, { message: "Las dimensiones deben tener al menos 2 caracteres." }),
  numeroPaginas: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int({ message: "El número de páginas debe ser un entero." })
  ),
  pesoGramos: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int({ message: "El peso en gramos debe ser un entero." })
  ),
  tiraje_o_ibd: z.string().min(1, { message: "El tiraje es requerido" }),
  idioma: z.enum(["español", "ingles", "frances", "aleman", "portugues"], {
    errorMap: () => ({ message: "Selecciona un idioma válido" }),
  }),
  esTraduccion: z.boolean(),
  sinopsis: z
    .string()
    .min(1, { message: "La sinopsis es requerida" })
    .max(500, { message: "La sinopsis no debe exceder los 500 caracteres" }),
  depositoLegal: z.boolean(),
});

export default function BookForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [selectedDLPDF, setSelectedDLPDF] = useState(null);
  const [autoresOptions, setAutoresOptions] = useState([]);
  const [isbnInput, setIsbnInput] = useState("");
  const [isbnTouched, setIsbnTouched] = useState(false);
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
    mode: "onBlur", // solo al salir del input
    reValidateMode: "onSubmit", // o al submit
  });

  // Sincroniza el input controlado con react-hook-form
  useEffect(() => {
    setValue("isbn", isbnInput, { shouldValidate: true });
  }, [isbnInput, setValue]);

  // Manejo del formato ISBN
  const handleIsbnChange = (e) => {
    let value = e.target.value.replace(/[^0-9Xx\-]/g, "").slice(0, 17);
    setIsbnInput(value);
    setIsbnExists(false); // reset indicador si el usuario edita
  };

  // Botón que añade el dígito de control y verifica duplicados
  const handleCalculateCheckDigit = async () => {
    const raw = isbnInput.replace(/-/g, "").toUpperCase();

    let fullISBN = "";

    if (/^\d{9}$/.test(raw)) {
      // ISBN-10 sin dígito de control
      const checkDigit = calculateISBN10CheckDigit(raw);
      fullISBN = raw + checkDigit;
    } else if (/^\d{12}$/.test(raw)) {
      // ISBN-13 sin dígito de control
      const checkDigit = calculateISBN13CheckDigit(raw);
      fullISBN = raw + checkDigit;
    } else if (
      /^\d{10}$/.test(raw) ||
      /^\d{9}X$/.test(raw) ||
      /^\d{13}$/.test(raw)
    ) {
      // Ya es un ISBN completo
      fullISBN = raw;
    } else {
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
      console.error("Error verificando ISBN:", error);
      toastError("Error al verificar el ISBN. Intenta nuevamente.");
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
  const tieneDepositoLegal = watch("depositoLegal");
  const [coautores, setCoautores] = useState([]);

  // Limpia archivo de depósito legal si se desmarca
  useEffect(() => {
    if (!tieneDepositoLegal) {
      setSelectedDLPDF(null);
    }
  }, [tieneDepositoLegal]);

  // Carga la lista de autores para el select
  useEffect(() => {
    supabase
      .from("autores")
      .select("id, nombre_completo, dependencia_id, unidad_academica_id")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setAutoresOptions(data);
      });
  }, []);

  const addCoautor = () => setCoautores([...coautores, ""]);
  const removeCoautor = (idx) =>
    setCoautores(coautores.filter((_, i) => i !== idx));
  const updateCoautor = (idx, val) => {
    const arr = [...coautores];
    arr[idx] = val;
    setCoautores(arr);
  };

  //manejo de archivos
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handlePDFChange = (e) => setSelectedPDF(e.target.files[0]);
  const handleDLPDFChange = (e) => setSelectedDLPDF(e.target.files[0]);

  // Validación depósito legal
  const onSubmit = async (data) => {
    if (data.depositoLegal && !selectedDLPDF) {
      toastError("Debes subir el archivo de Depósito Legal.");
      return;
    }
    // 0) Usuario autenticado
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      toastError("Debes iniciar sesión para registrar un libro.");
      return;
    }
    const usuarioId = user.id;

    // 0.b) Leer su role para auditoría
    const { data: usuarioRow, error: errUserRow } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", usuarioId)
      .single();
    if (errUserRow || !usuarioRow) {
      console.error("No se pudo leer el role del usuario:", errUserRow);
      toastError("Error interno al verificar permisos.");
      return;
    }
    const usuarioRole = usuarioRow.role; // ej. 'Administrador' o 'Editor'

    // 1) Subir archivos
    let imageUrl = "",
      pdfUrl = "",
      dlpdfUrl = "";
    try {
      if (selectedFile) {
        const name = `portadas/${Date.now()}-${selectedFile.name}`;
        await supabase.storage.from("portadas").upload(name, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });
        imageUrl = supabase.storage.from("portadas").getPublicUrl(name)
          .data.publicUrl;
      }
      if (selectedPDF) {
        const name = `libros/${Date.now()}-${selectedPDF.name}`;
        await supabase.storage.from("libros").upload(name, selectedPDF, {
          cacheControl: "3600",
          upsert: false,
        });
        pdfUrl = supabase.storage.from("libros").getPublicUrl(name)
          .data.publicUrl;
      }
      if (selectedDLPDF) {
        const name = `depositolegal/${Date.now()}-${selectedDLPDF.name}`;
        await supabase.storage
          .from("depositolegal")
          .upload(name, selectedDLPDF, {
            cacheControl: "3600",
            upsert: false,
          });
        dlpdfUrl = supabase.storage.from("depositolegal").getPublicUrl(name)
          .data.publicUrl;
      }
    } catch (e) {
      console.error("Error al subir archivos:", e);
      toastError("Error al subir archivos.");
      return;
    }

    // 2) Extraer selectedAutorId y buscar autor
    const { selectedAutorId, ...libroFields } = data;
    if (!selectedAutorId) {
      toastError("Debes seleccionar un autor.");
      return;
    }
    const autor = autoresOptions.find((a) => a.id === selectedAutorId);
    if (!autor) {
      toastError("Autor no válido");
      return;
    }

    // 3) Insertar en libros
    const { data: nuevoLibro, error: errLibro } = await supabase
      .from("libros")
      .insert([
        {
          ...libroFields,
          idioma: libroFields.idioma,
          user_id: usuarioId,
          dependencia_id: autor.dependencia_id,
          unidad_academica_id: autor.unidad_academica_id,
          portada: imageUrl,
          archivo_pdf: pdfUrl,
          depositoLegal_pdf: dlpdfUrl || null,
        },
      ])
      .select("id_libro")
      .single();

    if (errLibro) {
      console.error("Error al insertar libro:", errLibro);
      toastError("No se pudo registrar el libro.");
      return;
    }

    // 4) Insertar en libro_autor
    const relaciones = [
      {
        libro_id: nuevoLibro.id_libro,
        autor_id: selectedAutorId,

        tipo_autor: "autor",
      },
    ];
    if (tipoAutoria !== "individual") {
      coautores.forEach((coId) => {
        relaciones.push({
          libro_id: nuevoLibro.id_libro,
          autor_id: parseInt(coId, 10),

          tipo_autor: "coautor",
        });
      });
    }

    const { error: errLA } = await supabase
      .from("libro_autor")
      .insert(relaciones);
    if (errLA) {
      console.error("Error al relacionar autor:", errLA);
      toastError("Libro registrado, pero no se pudo vincular autor.");
      return;
    }

    // 5) Éxito
    toastSuccess("Libro y autor relacionados correctamente");
    reset();
    setSelectedFile(null);
    setSelectedPDF(null);
    setSelectedDLPDF(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
      {/* formulario de registro de libros*/}
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
            {/* Aquí puedes agregar todos los campos del formulario */}
            {/* SELECT autor principal */}
            <div className="mb-4 col-span-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Selecciona Autor Principal
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
            {/* SELECT tipo autoria */}
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                      className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue 
                   focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg 
                   text-sm transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCoautor}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg
               text-sm mt-2 transition-colors duration-200"
                >
                  Añadir coautor
                </button>
              </div>
            )}

            {/* Resto de campos del libro */}
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa tu código de registro"
              />
              {errors.codigoRegistro && ( // Muestra el mensaje de error si existe
                <p className="text-red-500 text-xs italic">
                  {errors.codigoRegistro.message}
                </p>
              )}
            </div>

            {/* Campo controlado para ISBN */}
            <div className="mb-4 flex flex-col">
              <label
                htmlFor="isbn"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                ISBN
              </label>

              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  id="isbn"
                  {...register("isbn")}
                  value={isbnInput}
                  onChange={handleIsbnChange}
                  placeholder="Escribe hasta 9 o 12 dígitos"
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
                  title="Autocompletar dígito de control"
                >
                  {checkingISBN ? "Verificando..." : "Calcular"}
                </button>
              </div>

              {/* SOLO muestra el error si el campo fue tocado */}
              {touchedFields.isbn && errors.isbn && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.isbn.message}
                </p>
              )}
            </div>

            {/* DOI formato oficial */}
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
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ej. 10.1000/xyz123"
              />
              {errors.doi && (
                <p className="text-red-500 text-xs italic">
                  {errors.doi.message}
                </p>
              )}
            </div>

            {/* Título (obligatorio) */}
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
                {...register("titulo")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa tu Titulo"
              />
              {errors.titulo && (
                <p className="text-red-500 text-xs italic">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            {/* Subtitulo (opcional) */}
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
                {...register("subtitulo")}
                // IMPORTANTE: quitar required para que sea opcional
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa tu Subtitulo (opcional)"
              />
              {errors.subtitulo && (
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                {...register("formato")}
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
              >
                <option value="" disabled>
                  Selecciona un formato de impresión
                </option>
                <option value="impreso">Impreso</option>
                <option value="electronico">Electrónico</option>
                <option value="ambos">Ambos</option>
              </select>
              {errors.formato && (
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                htmlFor="idioma"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Idioma
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
              </select>
              {errors.idioma && (
                <p className="text-red-500 text-xs italic">
                  {errors.idioma.message}
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

            <div className="mb-4 col-span-full">
              <label
                htmlFor="sinopsis"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Sinopsis
              </label>
              <textarea
                id="sinopsis"
                {...register("sinopsis")}
                required
                rows="4"
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                placeholder="Ingresa la sinopsis del libro (máximo 500 caracteres)"
              ></textarea>
              {errors.sinopsis && (
                <p className="text-red-500 text-xs italic">
                  {errors.sinopsis.message}
                </p>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Caracteres restantes: {500 - (watch("sinopsis")?.length || 0)}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="depositoLegal"
                className="inline-flex items-center text-gray-700 text-sm font-bold"
              >
                <input
                  type="checkbox"
                  id="depositoLegal"
                  {...register("depositoLegal")}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Tiene Depósito Legal</span>
              </label>
            </div>

            {tieneDepositoLegal && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Archivo Depósito Legal PDF
                </label>
                <input
                  type="file"
                  onChange={handleDLPDFChange}
                  className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                  accept=".pdf"
                  required // Solo si quieres que sea obligatorio cuando esté visible
                />
              </div>
            )}

            {/* Campos para seleccionar archivos */}
            <div className="mb-4">
              <label
                htmlFor="portada"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Portada
              </label>
              <input
                type="file"
                id="portada"
                onChange={handleFileChange} // Se cambia a manejar el archivo directamente
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".jpg, .jpeg, .png"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo Libro PDF
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
                required
              />
            </div>

            {/* Botón de registro*/}
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
