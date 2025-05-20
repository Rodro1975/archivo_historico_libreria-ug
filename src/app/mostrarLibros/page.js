"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";
import { toast, Toaster } from "react-hot-toast";

const MostrarLibrosPage = () => {
  const [libros, setLibros] = useState([]);
  const [filteredLibros, setFilteredLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLibro, setCurrentLibro] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

  // Filtrar los libros al cambiar el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredLibros(libros); // Mostrar todos si no hay término de búsqueda
    } else {
      const lowerCaseTerm = searchTerm.toLowerCase();
      const results = libros.filter((libro) =>
        libro.titulo?.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredLibros(results);
    }
  }, [searchTerm, libros]);

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

      {/* Barra de búsqueda con botón limpiar */}
      <div className="flex gap-2 max-w-screen-lg mx-auto px-4 mb-2">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded text-black bg-white"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded"
            title="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}
      </div>
      {/* Mensaje contextual */}
      {searchTerm && (
        <p className="text-sm text-gray-500 text-center mb-2">
          Haz clic en Limpiar para ver todos los libros.
        </p>
      )}

      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Id Libro</th>
              <th className="border px-4 py-2">Código de Registro</th>
              <th className="border px-4 py-2">ISBN</th>
              <th className="border px-4 py-2">DOI</th>
              <th className="border px-4 py-2">Titulo</th>
              <th className="border px-4 py-2">Acciones</th>
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
                    onClick={() => {
                      setLibroAEliminar(libro.codigoRegistro);
                      setShowConfirm(true);
                    }}
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
      <Toaster position="top-right" />

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <h2 className="text-lg font-bold mb-4 text-blue">
              ¿Eliminar libro?
            </h2>
            <p className="mb-6 text-gray-700">
              ¿Estás seguro de que deseas eliminar este libro? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await handleDelete(libroAEliminar);
                  toast.success("Libro eliminado correctamente");
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MostrarLibrosPage;
