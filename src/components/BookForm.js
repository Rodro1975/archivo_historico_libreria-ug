"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";

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
    .min(2, { message: "El ISBN debe tener al menos 2 caracteres." }),
  doi: z
    .string()
    .min(2, { message: "El DOI debe tener al menos 2 caracteres." }),
  titulo: z.string().min(1, { message: "El título es requerido" }),
  subtitulo: z.string().optional(),
  materia: z.string().optional(),
  tematica: z.string().optional(),
  coleccion: z.string().min(1, { message: "La colección es requerida" }),
  numeroEdicion: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int({ message: "El número de edición debe ser un entero." })
  ),
  anioPublicacion: z.preprocess(
    (val) => parseInt(val, 10),
    z.number().int({ message: "El año de publicación debe ser un entero." })
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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterBookSchema),
    defaultValues: {
      tipoAutoria: "individual",
      formato: "",
      idioma: "",
    },
  });

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

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handlePDFChange = (e) => setSelectedPDF(e.target.files[0]);
  const handleDLPDFChange = (e) => setSelectedDLPDF(e.target.files[0]);

  const onSubmit = async (data) => {
    // Validación depósito legal
    if (data.depositoLegal && !selectedDLPDF) {
      toast.error("Debes subir el archivo de Depósito Legal.");
      return;
    }
    // 0) Usuario autenticado
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      toast.error("Debes iniciar sesión para registrar un libro.");
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
      toast.error("Error interno al verificar permisos.");
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
      toast.error("Error al subir archivos.");
      return;
    }

    // 2) Extraer selectedAutorId y buscar autor
    const { selectedAutorId, ...libroFields } = data;
    if (!selectedAutorId) {
      toast.error("Debes seleccionar un autor.");
      return;
    }
    const autor = autoresOptions.find((a) => a.id === selectedAutorId);
    if (!autor) {
      toast.error("Autor no válido");
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
      toast.error("No se pudo registrar el libro.");
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
      toast.error("Libro registrado, pero no se pudo vincular autor.");
      return;
    }

    // 5) Éxito
    toast.success("Libro y autor relacionados correctamente");
    reset();
    setSelectedFile(null);
    setSelectedPDF(null);
    setSelectedDLPDF(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-40 mb-20 mr-10 ml-10">
      <Toaster position="top-right" />
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
            <h1 className="font-black text-3xl mb-5 text-gold">
              Registrar un nuevo libro
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
                type="number"
                id="anioPublicacion"
                {...register("anioPublicacion")} // Registra el campo con react-hook-form
                required
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
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
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Archivo PDF
              </label>
              <input
                type="file"
                onChange={handlePDFChange}
                className="border border-yellow rounded-lg px-3 py-2 text-sm text-blue focus:border-blue focus:ring-gold focus:ring-2 focus:outline-none w-full"
                accept=".pdf"
              />
            </div>

            {/* Botón de registro*/}
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
    </div>
  );
}
