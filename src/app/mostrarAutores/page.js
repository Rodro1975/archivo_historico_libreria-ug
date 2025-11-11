"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarAutores from "@/components/ActualizarAutores";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// ✅ NEW: importa hook y componente de paginación
import usePageSlice from "@/hooks/usePageSlice";
import Pagination from "@/components/Pagination";

/** Heurística simple para separar Apellido / Nombre en español.
 * - 1 token: nombre
 * - 2 tokens: [nombre] [apellido]
 * - 3+ tokens: últimos 2 = apellidos; el resto = nombre(s)
 */
function splitNombreES(full = "") {
  const clean = (full || "").normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!clean) return { apellido: "", nombre: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { apellido: "", nombre: parts[0] };
  if (parts.length === 2) return { apellido: parts[1], nombre: parts[0] };
  const apellido = parts.slice(-2).join(" ");
  const nombre = parts.slice(0, -2).join(" ");
  return { apellido, nombre };
}

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
        ); // se mantienen los campos visibles y relaciones

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

  // Búsqueda por apellido/nombre (y también por nombre completo)
  const handleSearch = useCallback(
    (term) => {
      const lower = (term || "").toLowerCase();
      setFilteredAutores(
        autores.filter((a) => {
          const full = a?.nombre_completo || "";
          const { apellido, nombre } = splitNombreES(full);
          const hay = `${apellido} ${nombre} ${full}`.toLowerCase();
          return hay.includes(lower);
        })
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

  // ✅ NEW: paginación de 5 en 5 sobre el arreglo YA filtrado
  const {
    page,
    setPage,
    total,
    totalPages,
    start,
    end,
    pageItems, // <- usa esto en el <tbody>
  } = usePageSlice(filteredAutores, 5);

  // ✅ NEW: si cambia el término de búsqueda, vuelve a la página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, setPage]);

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
            className="w-full p-2 rounded border bg-gray text-blue placeholder-blue-900 font-bold"
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
        {/* Tabla de autores */}
        <div className="overflow-x-auto w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4">
          <table className="min-w-full bg-white border border-gray-300 text-blue mb-2 text-xs sm:text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs">
              <tr>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  Apellido
                </th>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  Nombre
                </th>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  Institución
                </th>
                <th className="border px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                  Rectoría/Campus/CNMS/Secretaría
                </th>

                <th className="border px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                  División/Escuela
                </th>

                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  Correo Institucional
                </th>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAutores.length > 0 ? (
                pageItems.map((autor) => {
                  const { apellido, nombre } = splitNombreES(
                    autor?.nombre_completo || ""
                  );
                  return (
                    <tr key={autor.id}>
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                        {apellido || "—"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                        {nombre || "—"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
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
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                        {autor?.dependencias?.nombre ??
                          autor?.dependencia_id ??
                          "—"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                        {autor?.unidades_academicas?.nombre ??
                          autor?.unidad_academica_id ??
                          "—"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                        {autor.correo_institucional}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 align-middle">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={() => {
                              setCurrentAutor(autor);
                              setIsEditing(true);
                            }}
                            className="inline-flex items-center gap-1 sm:gap-2 rounded-md border border-amber-500/70 bg-transparent px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-700 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors"
                            title="Modificar autor"
                          >
                            <FaEdit />
                            <span className="hidden sm:inline">Modificar</span>
                          </button>
                          <button
                            onClick={() => {
                              setAutorAEliminar(autor);
                              setShowConfirm(true);
                            }}
                            className="inline-flex items-center gap-1 sm:gap-2 rounded-md border border-red-600/70 bg-transparent px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30 transition-colors"
                            title="Eliminar autor"
                          >
                            <FaTrash />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

        {/* ✅ NEW: paginación debajo de la tabla */}
        <div className="w-full max-w-screen-lg mx-auto px-4 mb-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            start={start}
            end={end}
            onPageChange={setPage}
          />
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
