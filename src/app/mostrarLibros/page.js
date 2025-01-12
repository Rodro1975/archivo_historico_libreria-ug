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
              {/* Más columnas aquí */}
              <th className="border px-4 py-2">Acciones</th>
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
                {/* Más datos aquí */}
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
