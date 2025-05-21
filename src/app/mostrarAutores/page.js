"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarAutores from "@/components/ActualizarAutores";
import { FaTrash, FaEdit } from "react-icons/fa";

const MostrarAutoresPage = () => {
  const [autores, setAutores] = useState([]);
  const [filteredAutores, setFilteredAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAutor, setCurrentAutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1) Traer autores con FK + relación
  const fetchAutores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase.from("autores")
        .select(`
          id,
          nombre_completo,
          cargo,
          correo_institucional,
          vigencia,
          dependencia_id,
          unidad_academica_id,
          dependencias (nombre),
          unidades_academicas (nombre)
        `);

      if (supabaseError) throw supabaseError;
      setAutores(data || []);
      setFilteredAutores(data || []);
    } catch (err) {
      setError(err.message);
      setFilteredAutores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2) Filtrado local
  const handleSearch = useCallback(
    (term) => {
      const lower = term.toLowerCase();
      setFilteredAutores(
        autores.filter((a) => a.nombre_completo.toLowerCase().includes(lower))
      );
    },
    [autores]
  );

  // 3) Eliminar autor
  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar autor ID: ${id}?`)) return;
    try {
      const { error } = await supabase.from("autores").delete().eq("id", id);
      if (error) throw error;
      fetchAutores();
    } catch (err) {
      console.error("Error eliminando autor:", err.message);
    }
  };

  // Carga inicial y efecto de búsqueda
  useEffect(() => {
    fetchAutores();
  }, [fetchAutores]);
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  if (loading) return <p className="text-center mt-8">Cargando autores...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-8">Error: {error}</p>;

  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <div className="min-h-screen bg-blue">
        <WorkBar />

        <h1 className="text-4xl text-yellow text-center font-bold mt-8 mb-8">
          Lista de Autores
        </h1>

        {/* Búsqueda con botón limpiar */}
        <div className="flex gap-2 max-w-screen-lg mx-auto px-4 mb-2">
          <input
            type="text"
            placeholder="Buscar por nombre de autor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white placeholder-gray-400"
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
            Haz clic en Limpiar para ver todos los autores.
          </p>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
          <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">Nombre Completo</th>
                <th className="border px-4 py-2">Cargo</th>
                <th className="border px-4 py-2">Dependencia ID</th>
                <th className="border px-4 py-2">Unidad Académica ID</th>
                <th className="border px-4 py-2">Correo Institucional</th>
                <th className="border px-4 py-2">Vigencia</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAutores.length > 0 ? (
                filteredAutores.map((autor) => (
                  <tr key={autor.id}>
                    <td className="border px-4 py-2">
                      {autor.nombre_completo}
                    </td>
                    <td className="border px-4 py-2">{autor.cargo}</td>
                    <td className="border px-4 py-2">
                      {autor.dependencia_id ?? "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {autor.unidad_academica_id ?? "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {autor.correo_institucional}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {autor.vigencia ? "✅" : "❌"}
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDelete(autor.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg text-white px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                        title="Eliminar autor"
                      >
                        <FaTrash />
                        Eliminar
                      </button>

                      <button
                        onClick={() => {
                          setCurrentAutor(autor);
                          setIsEditing(true);
                        }}
                        className="flex items-center gap-2 bg-gold hover:bg-yellow shadow-md hover:shadow-lg text-blue-900 px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                        title="Modificar autor"
                      >
                        <FaEdit />
                        Modificar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No se encontraron autores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Formulario de edición */}
        {isEditing && currentAutor && (
          <ActualizarAutores
            autor={currentAutor}
            onClose={() => {
              setIsEditing(false);
              setCurrentAutor(null);
            }}
            onUpdate={() => {
              fetchAutores();
              setIsEditing(false);
              setCurrentAutor(null);
            }}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MostrarAutoresPage;
