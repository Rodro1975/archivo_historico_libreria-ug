"use client";

import { useEffect, useState, Suspense } from "react";
import supabase from "@/lib/supabase"; // Asegúrate de que esta configuración esté correctamente configurada.
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";
import { useSearchParams } from "next/navigation";

const SearchBar = ({ libros, setFilteredLibros }) => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams?.get("search") || "";

  useEffect(() => {
    const handleSearch = (term) => {
      if (!term) {
        setFilteredLibros(libros); // Mostrar todos si no hay término de búsqueda
        return;
      }
      const lowerCaseTerm = term.toLowerCase();
      const results = libros.filter((libro) =>
        libro.titulo?.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredLibros(results);
    };

    handleSearch(searchTerm);
  }, [searchTerm, libros, setFilteredLibros]);

  return null;
};

const MostrarLibrosPage = async () => {
  const [libros, setLibros] = useState([]);
  const [filteredLibros, setFilteredLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLibro, setCurrentLibro] = useState(null);

  // Función para obtener los datos de la tabla
  const fetchLibros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("libros").select("*");

      if (error) throw new Error(error.message);
      if (!data)
        throw new Error("No se encontraron datos en la tabla 'libros'.");

      setLibros(data);
      setFilteredLibros(data);
    } catch (err) {
      console.error("Error al obtener libros:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar los datos al montar el componente
  useEffect(() => {
    fetchLibros();
  }, []);

  // Función para eliminar un registro
  const handleDelete = async (codigoRegistro) => {
    try {
      const { error } = await supabase
        .from("libros")
        .delete()
        .eq("codigoRegistro", codigoRegistro);

      if (error) throw new Error(error.message);
      await fetchLibros();
    } catch (err) {
      console.error("Error al eliminar el libro:", err.message);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <WorkBar />
      <h1 className="text-4xl text-yellow text-center font-bold mt-8 mb-8">
        Lista de libros
      </h1>
      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
          <thead>
            <tr>
              {/* Encabezados de la tabla */}
              <th className="border px-4 py-2">Id Libro</th>
              <th className="border px-4 py-2">Código de Registro</th>
              {/* Resto de columnas */}
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredLibros.map((libro) => (
              <tr key={libro.id_libro}>
                <td className="border px-4 py-2">{libro.id_libro}</td>
                <td className="border px-4 py-2">{libro.codigoRegistro}</td>
                {/* Resto de datos */}
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDelete(libro.codigoRegistro)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MostrarLibrosPage;
