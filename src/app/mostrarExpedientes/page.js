"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarExpedientes from "@/components/ActualizarExpedientes";
import { FaTrash, FaEdit, FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// 👇 imports para paginación
import usePageSlice from "@/hooks/usePageSlice";
import Pagination from "@/components/Pagination";

const fold = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const fmtSize = (b) => {
  if (b === null || b === undefined) return "—";
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

export default function MostrarExpedientesPage() {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("libro_adjuntos")
        .select(
          `
          id, libro_id, tipo, origen, storage_path, url, titulo, notas, mime_type, size_bytes, uploaded_by, created_at, updated_at,
          libros:libros ( id_libro, codigoRegistro, titulo, archivo_pdf )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows(data || []);
      setFiltered(data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar expedientes");
      setRows([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Búsqueda (por código registro, título del libro, tipo, notas)
  useEffect(() => {
    const term = fold(searchTerm);
    if (!term) {
      setFiltered(rows);
      return;
    }
    setFiltered(
      rows.filter((r) => {
        const cr = fold(r?.libros?.codigoRegistro);
        const tl = fold(r?.libros?.titulo);
        const tp = fold(r?.tipo);
        const nt = fold(r?.notas);
        return (
          cr.includes(term) ||
          tl.includes(term) ||
          tp.includes(term) ||
          nt.includes(term)
        );
      })
    );
  }, [searchTerm, rows]);

  // ✅ Paginación (5 por página) sobre la lista filtrada
  const {
    page,
    setPage,
    total,
    totalPages,
    start,
    end,
    pageItems, // <- usar en el tbody
  } = usePageSlice(filtered, 5);

  // ✅ Reset a página 1 cuando cambie la búsqueda o el total
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filtered.length, setPage]);

  const openRow = async (r) => {
    try {
      if (r.origen === "url" && r.url) {
        window.open(r.url, "_blank");
        return;
      }
      if (r.origen === "upload" && r.storage_path) {
        const { data, error } = await supabase.storage
          .from("expedientes")
          .createSignedUrl(r.storage_path, 60);
        if (error) throw error;
        window.open(data.signedUrl, "_blank");
        return;
      }
      if (r.tipo === "pdf_completo" && r.libros?.archivo_pdf) {
        window.open(r.libros.archivo_pdf, "_blank");
        return;
      }
      toastError("No hay archivo ni URL disponible para este expediente.");
    } catch (e) {
      console.error(e);
      toastError("No se pudo abrir el expediente.");
    }
  };

  const handleDelete = async () => {
    if (!rowToDelete?.id) return;
    try {
      const { error } = await supabase
        .from("libro_adjuntos")
        .delete()
        .eq("id", rowToDelete.id);
      if (error) throw error;
      toastSuccess("Expediente eliminado correctamente.");
      setRowToDelete(null);
      fetchAll();
    } catch (e) {
      console.error(e);
      toastError("No se pudo eliminar el expediente.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-200">Error: {error}</p>;

  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <div className="min-h-screen bg-blue">
        <WorkBar />
        <h1 className="text-4xl text-yellow text-center font-bold mt-28 mb-8">
          Lista de Expedientes
        </h1>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto px-4 mb-2">
          <input
            type="text"
            placeholder="Buscar por código, título, tipo o nota"
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
          <p className="text-sm text-gray-300 text-center mb-2">
            Haz clic en Limpiar para ver todos los expedientes.
          </p>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
          <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Código de Registro</th>
                <th className="border px-4 py-2">Título del libro</th>
                <th className="border px-4 py-2">Tipo</th>
                <th className="border px-4 py-2">Origen</th>
                <th className="border px-4 py-2">Tamaño</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Notas</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length ? (
                pageItems.map((r) => (
                  <tr key={r.id}>
                    <td className="border px-4 py-2">{r.id}</td>
                    <td className="border px-4 py-2">
                      {r.libros?.codigoRegistro ?? "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {r.libros?.titulo ?? "—"}
                    </td>
                    <td className="border px-4 py-2">{r.tipo}</td>
                    <td className="border px-4 py-2">{r.origen}</td>
                    <td className="border px-4 py-2">
                      {fmtSize(r.size_bytes)}
                    </td>
                    <td className="border px-4 py-2">
                      {fmtDate(r.created_at)}
                    </td>
                    <td className="border px-4 py-2">{r.notas ?? "—"}</td>
                    <td className="border px-4 py-2">
                      <div className="flex flex-col gap-2">
                        {/* Abrir (ghost con azul HEX) */}
                        <button
                          onClick={() => openRow(r)}
                          className="inline-flex items-center gap-2 rounded-md border border-[#0F3D91]/70 bg-transparent px-4 py-1.5 text-sm font-medium text-[#0F3D91] hover:bg-[#0F3D91]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D91]/30 transition-colors"
                          title="Abrir"
                        >
                          <FaExternalLinkAlt />
                          Abrir
                        </button>

                        {/* Modificar (ghost ámbar) */}
                        <button
                          onClick={() => {
                            setCurrentRow(r);
                            setIsEditing(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-md border border-amber-500/70 bg-transparent px-4 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors"
                          title="Modificar"
                        >
                          <FaEdit />
                          Modificar
                        </button>

                        {/* Eliminar (ghost rojo) */}
                        <button
                          onClick={() => setRowToDelete(r)}
                          className="inline-flex items-center gap-2 rounded-md border border-red-600/70 bg-transparent px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30 transition-colors"
                          title="Eliminar"
                        >
                          <FaTrash />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center py-4" colSpan={9}>
                    No hay expedientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación (debajo del scroll) */}
        <div className="max-w-screen-lg mx-auto px-4 mb-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            start={start}
            end={end}
            onPageChange={(p) => setPage(p)}
          />
        </div>

        {/* Modal de confirmación de borrado */}
        {rowToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-red-700">
                ¿Eliminar expediente?
              </h2>
              <p className="text-gray-700 mb-4">
                ¿Seguro que deseas eliminar el expediente{" "}
                <strong>{rowToDelete.tipo}</strong> del libro{" "}
                <strong>{rowToDelete?.libros?.codigoRegistro ?? "—"}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRowToDelete(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {isEditing && currentRow && (
          <ActualizarExpedientes
            row={currentRow}
            onClose={() => {
              setIsEditing(false);
              setCurrentRow(null);
            }}
            onUpdate={() => {
              fetchAll();
              setIsEditing(false);
              setCurrentRow(null);
            }}
          />
        )}
      </div>
    </Suspense>
  );
}
