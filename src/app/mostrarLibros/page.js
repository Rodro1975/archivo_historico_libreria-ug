"use client";

import { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";

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
  const [principalMap, setPrincipalMap] = useState({}); // { [id_libro]: "Nombre Autor 1" }

  //Helper para elegir autor principal
  const pickPrincipal = (rows = []) => {
    if (!rows.length) return null;
    const norm = (x) => (x || "").toString().toLowerCase();
    const by = (pred) => rows.find((r) => pred(norm(r?.tipo_autor)));
    const row =
      by((t) => t.includes("principal")) || by((t) => t === "autor") || rows[0];
    return row?.autor?.nombre_completo || null;
  };

  const fetchLibros = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("libros").select("*");
      if (error) throw new Error(error.message);
      setLibros(data || []);
      setFilteredLibros(data || []);

      // Cargar autores principales en un solo fetch (no N+1)
      if (data?.length) {
        const ids = data.map((l) => l.id_libro).filter(Boolean);

        const { data: la, error: e2 } = await supabase
          .from("libro_autor")
          .select("libro_id, tipo_autor, autor:autores ( nombre_completo )")
          .in("libro_id", ids);

        if (!e2 && la) {
          // Agrupar por libro_id
          const byLibro = la.reduce((acc, row) => {
            (acc[row.libro_id] ||= []).push(row);
            return acc;
          }, {});

          // Construir mapa id_libro -> Autor 1
          const map = {};
          ids.forEach((id) => {
            map[id] = pickPrincipal(byLibro[id] || []) || null;
          });
          setPrincipalMap(map);
        } else {
          setPrincipalMap({});
        }
      } else {
        setPrincipalMap({});
      }
    } catch (err) {
      console.error("Error al obtener libros:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibros();
  }, [fetchLibros]);

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
      <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
        Lista de Libros
      </h1>

      {/* Barra de búsqueda amarilla con hexágono y botón limpiar */}
      <div className="flex items-center gap-2 max-w-screen-lg mx-auto px-4 mb-2">
        <input
          type="text"
          placeholder="Buscar por título de libro"
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
        <p className="text-sm text-gray-300 text-center mb-2">
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
              <th className="border px-4 py-2">Autor Principal</th>

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
                  {principalMap[libro.id_libro] ?? "—"}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      setLibroAEliminar(libro);
                      setShowConfirm(true);
                    }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg text-white px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                  >
                    <FaTrash />
                    Eliminar
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLibro(libro);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2 bg-gold hover:bg-yellow shadow-md hover:shadow-lg text-blue-900 px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                  >
                    <FaEdit />
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

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-700">
              ¿Eliminar libro?
            </h2>
            <p className="mb-6 text-gray-700">
              ¿Estás seguro de que deseas eliminar el libro{" "}
              <strong>{libroAEliminar?.titulo}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await handleDelete(libroAEliminar);
                  toastSuccess("Libro eliminado correctamente");
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
