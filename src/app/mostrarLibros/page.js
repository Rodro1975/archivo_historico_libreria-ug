"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import supabase from "@/lib/supabase"; // Asegúrate de configurar correctamente Supabase
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";
import { useSearchParams } from "next/navigation";

const SearchBar = ({ libros, setFilteredLibros }) => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

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

  useEffect(() => {
    fetchLibros();
  }, []);

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

      <Suspense fallback={<div>Cargando barra de búsqueda...</div>}>
        <SearchBar libros={libros} setFilteredLibros={setFilteredLibros} />
      </Suspense>

      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Id Libro</th>
              <th className="border px-4 py-2">Código de Registro</th>
              <th className="border px-4 py-2">ISBN</th>
              <th className="border px-4 py-2">DOI</th>
              <th className="border px-4 py-2">Titulo</th>
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

      {isEditing && currentLibro && (
        <ActualizarLibros
          libro={currentLibro}
          onClose={() => {
            setIsEditing(false);
            setCurrentLibro(null);
          }}
          onUpdate={() => {
            fetchLibros();
            setIsEditing(false);
            setCurrentLibro(null);
          }}
        />
      )}
    </div>
  );
};

export default MostrarLibrosPage;
