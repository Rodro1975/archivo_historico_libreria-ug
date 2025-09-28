"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarAutores from "@/components/ActualizarAutores";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { toastSuccess, toastError } from "@/lib/toastUtils";

const MostrarAutoresPage = () => {
  const [autores, setAutores] = useState([]);
  const [filteredAutores, setFilteredAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAutor, setCurrentAutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [autorAEliminar, setAutorAEliminar] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchAutores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from("autores")
        .select(
          `
          id,
          nombre_completo,
          institucion_tipo,
          institucion_nombre,
          correo_institucional,
          dependencia_id,
          unidad_academica_id,
          dependencias ( nombre ),
          unidades_academicas ( nombre )
        `
        ); // 👈 se quitó 'vigencia' y 'cargo' del select, se agrego 'institucion_tipo' e 'institucion_nombre'

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

  const handleSearch = useCallback(
    (term) => {
      const lower = term.toLowerCase();
      setFilteredAutores(
        autores.filter((a) =>
          (a?.nombre_completo || "").toLowerCase().includes(lower)
        )
      );
    },
    [autores]
  );

  const handleDelete = async () => {
    if (!autorAEliminar) return;
    try {
      const { error } = await supabase
        .from("autores")
        .delete()
        .eq("id", autorAEliminar.id);
      if (error) throw error;
      toastSuccess("Autor eliminado correctamente");
      fetchAutores();
    } catch (err) {
      toastError("Error al eliminar autor: " + err.message);
    } finally {
      setAutorAEliminar(null);
      setShowConfirm(false);
    }
  };

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

        <h1 className="text-4xl text-yellow text-center font-bold mt-28 mb-8">
          Lista de Autores
        </h1>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto px-4 mb-2">
          <input
            type="text"
            placeholder="Buscar por apellido de autor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded border bg-yellow text-blue placeholder-blue-900 font-bold"
          />
          <button
            className="w-12 h-12 bg-orange text-blue flex items-center justify-center transform rotate-30 clip-hexagon"
            title="Buscar"
            tabIndex={-1}
            disabled
          >
            <div className="w-full h-full flex items-center justify-center -rotate-30">
              <FaSearch className="text-blue" />
            </div>
          </button>
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
        <style jsx>{`
          .clip-hexagon {
            clip-path: polygon(
              50% 0%,
              100% 25%,
              100% 75%,
              50% 100%,
              0% 75%,
              0% 25%
            );
          }
        `}</style>

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
                <th className="border px-4 py-2">Institución</th>
                <th className="border px-4 py-2">
                  Rectoría/Campus/CNMS/Secretaría
                </th>
                <th className="border px-4 py-2">División/Escuela</th>
                <th className="border px-4 py-2">Correo Institucional</th>
                {/* 👇 Se elimina columna Vigencia */}
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
                    <td className="border px-4 py-2">
                      {autor.institucion_tipo === "UG"
                        ? "UG"
                        : autor.institucion_tipo === "Externa"
                        ? `Externa${
                            autor.institucion_nombre
                              ? " – " + autor.institucion_nombre
                              : ""
                          }`
                        : "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {/* Muestra nombre de la FK si existe; si no, el id como fallback */}
                      {autor?.dependencias?.nombre ??
                        autor?.dependencia_id ??
                        "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {autor?.unidades_academicas?.nombre ??
                        autor?.unidad_academica_id ??
                        "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {autor.correo_institucional}
                    </td>
                    {/* 👇 Sin columna vigencia */}
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => {
                          setAutorAEliminar(autor);
                          setShowConfirm(true);
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded mb-2"
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
                  {/* colSpan de 6 porque ya no está la columna “Vigencia” */}
                  <td colSpan="6" className="text-center py-4">
                    No se encontraron autores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de confirmación */}
        {showConfirm && autorAEliminar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-red-700">
                ¿Eliminar autor?
              </h2>
              <p className="mb-6 text-gray-700">
                ¿Estás seguro de que deseas eliminar al autor{" "}
                <strong>{autorAEliminar.nombre_completo}</strong>? Esta acción
                no se puede deshacer.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

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
