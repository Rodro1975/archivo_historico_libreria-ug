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

  return null; // Este componente no renderiza nada directamente
};

const MostrarLibrosPage = () => {
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

      {/* Envolviendo SearchBar en Suspense */}
      <Suspense fallback={<div>Cargando barra de búsqueda...</div>}>
        <SearchBar libros={libros} setFilteredLibros={setFilteredLibros} />
      </Suspense>

      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
          <thead>
            <tr>
              {/* Encabezados de la tabla */}
              <th className="border px-4 py-2">Id Libro</th>
              <th className="border px-4 py-2">Código de Registro</th>
              <th className="border px-4 py-2">ISBN</th>
              <th className="border px-4 py-2">DOI</th>
              <th className="border px-4 py-2">Titulo</th>
              {/* Otras columnas según sea necesario */}
            </tr>
          </thead>
          <tbody>
            {filteredLibros.map((libro) => (
              <tr key={libro.id_libro}>
                <td className="border px-4 py-2">{libro.id_libro}</td>
                <td className="border px-4 py-2">{libro.codigoRegistro}</td>
                <td className="border px-4 py-2">{libro.isbn}</td>
                <td className="border px-4 py-2">{libro.doi}</td>
                <td className="border px-4 py-2">{libro.titulo}</td>
                {/* Otras celdas según sea necesario */}
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
