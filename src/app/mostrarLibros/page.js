"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";

const MostrarLibrosPage = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLibro, setCurrentLibro] = useState(null);

  // Función para obtener los datos de la tabla
  const fetchLibros = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("libros").select("*");

    if (error) {
      setError(error.message);
    } else {
      setLibros(data);
    }
    setLoading(false);
  };

  // Función para eliminar un registro
  const handleDelete = async (codigoRegistro) => {
    const { error } = await supabase
      .from("libros")
      .delete()
      .eq("codigoRegistro", codigoRegistro);

    if (error) {
      console.error("Error al eliminar: ", error.message);
    } else {
      fetchLibros();
    }
  };

  // Efecto para cargar los datos al montar el componente
  useEffect(() => {
    fetchLibros();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <WorkBar />
      <h1 className="text-4xl text-yellow font-bold mb-8">Lista de libros</h1>
      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue">
          <thead>
            <tr>
              {/* Encabezados de la tabla */}
              <th className="border px-4 py-2">Id Libro</th>
              <th className="border px-4 py-2">Código de Registro</th>
              <th className="border px-4 py-2">ISBN</th>
              <th className="border px-4 py-2">DOI</th>
              <th className="border px-4 py-2">Titulo</th>
              <th className="border px-4 py-2">Subtitulo</th>
              <th className="border px-4 py-2">Materia</th>
              <th className="border px-4 py-2">Tematica</th>
              <th className="border px-4 py-2">Colección</th>
              <th className="border px-4 py-2">Número de Edición</th>
              <th className="border px-4 py-2">Año de publicación</th>
              <th className="border px-4 py-2">Formato</th>
              <th className="border px-4 py-2">Responsable de publicación</th>
              <th className="border px-4 py-2">Correo Responsable</th>
              <th className="border px-4 py-2">Teléfono Responsable</th>
              <th className="border px-4 py-2">Campus</th>
              <th className="border px-4 py-2">División</th>
              <th className="border px-4 py-2">Departamento</th>
              <th className="border px-4 py-2">Tipo de Autoria</th>
              <th className="border px-4 py-2">Dimensiones</th>
              <th className="border px-4 py-2">Número de páginas</th>
              <th className="border px-4 py-2">Idioma</th>
              <th className="border px-4 py-2">Peso en gramos</th>
              <th className="border px-4 py-2">Tiraje o IBD</th>
              <th className="border px-4 py-2">Es traducción</th>
              <th className="border px-4 py-2">Sinopsis</th>
              <th className="border px-4 py-2">Depósito Legal</th>
              <th className="border px-4 py-2">Fecha de registro</th>
              <th className="border px-4 py-2">Fecha de modificación</th>
              <th className="border px-4 py-2">Portada</th>
              <th className="border px-4 py-2">Archivo PDF</th>
              <th className="border px-4 py-2">Deposito Legal PDF</th>
            </tr>
          </thead>
          <tbody>
            {libros.map((libro) => (
              <tr key={libro.id_libro}>
                <td className="border px-4 py-2">{libro.id_libro}</td>
                <td className="border px-4 py-2">{libro.codigoRegistro}</td>
                <td className="border px-4 py-2">{libro.isbn}</td>
                <td className="border px-4 py-2">{libro.doi}</td>
                <td className="border px-4 py-2">{libro.titulo}</td>
                <td className="border px-4 py-2">{libro.subtitulo}</td>
                <td className="border px-4 py-2">{libro.materia}</td>
                <td className="border px-4 py-2">{libro.tematica}</td>
                <td className="border px-4 py-2">{libro.coleccion}</td>
                <td className="border px-4 py-2">{libro.numeroEdicion}</td>
                <td className="border px-4 py-2">{libro.anioPublicacion}</td>
                <td className="border px-4 py-2">{libro.formato}</td>
                <td className="border px-4 py-2">
                  {libro.responsablePublicacion}
                </td>
                <td className="border px-4 py-2">{libro.correoResponsable}</td>
                <td className="border px-4 py-2">
                  {libro.telefonoResponsable}
                </td>
                <td className="border px-4 py-2">{libro.campus}</td>
                <td className="border px-4 py-2">{libro.division}</td>
                <td className="border px-4 py-2">{libro.departamento}</td>
                <td className="border px-4 py-2">{libro.tipoAutoria}</td>
                <td className="border px-4 py-2">{libro.dimensiones}</td>
                <td className="border px-4 py-2">{libro.numeroPaginas}</td>
                <td className="border px-4 py-2">{libro.idioma}</td>
                <td className="border px-4 py-2">{libro.pesoGramos}</td>
                <td className="border px-4 py-2">{libro.tiraje_o_ibd}</td>
                <td className="border px-4 py-2">{libro.esTraduccion}</td>
                <td className="border px-4 py-2">{libro.sinopsis}</td>
                <td className="border px-4 py-2">{libro.depositoLegal}</td>
                <td className="border px-4 py-2">{libro.fecha_registro}</td>
                <td className="border px-4 py-2">{libro.fecha_modificacion}</td>
                <td className="border px-4 py-2">{libro.portada}</td>
                <td className="border px-4 py-2">{libro.archivo_pdf}</td>
                <td className="border px-4 py-2">{libro.depositoLegal_pdf}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDelete(libro.codigoRegistro)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLibro(libro);
                      setIsEditing(true);
                    }}
                    className="bg-yellow text-white px-4 py-1 rounded mt-2"
                  >
                    Modificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para editar libro */}
      {isEditing && currentLibro && (
        <ActualizarLibros
          libro={currentLibro}
          onClose={() => {
            setIsEditing(false); // Cierra el formulario al actualizar
            setCurrentLibro(null); // Limpia el libro actual
          }}
          onUpdate={() => {
            fetchLibros(); // Refresca la lista de libros después de actualizar
            setIsEditing(false); // Cierra el formulario después de actualizar
            setCurrentLibro(null); // Limpia el libro actual
          }}
        />
      )}
    </div>
  );
};

export default MostrarLibrosPage;
