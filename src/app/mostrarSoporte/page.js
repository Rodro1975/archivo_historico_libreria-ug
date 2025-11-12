"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { FaSearch } from "react-icons/fa";

// Paginación
import usePageSlice from "@/hooks/usePageSlice";
import Pagination from "@/components/Pagination";

export default function MostrarSoportePage() {
  const [soportes, setSoportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSoportes();
    fetchUsuarios();
  }, []);
  // Función para cargar los soportes desde Supabase
  async function fetchSoportes() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("soporte").select(`
        *,
        usuarios:usuario_id ( primer_nombre, apellido_paterno )
      `);

      if (error) throw error;

      setSoportes(Array.isArray(data) ? data : []);
    } catch (e) {
      toastError("Error al cargar soporte: " + (e?.message ?? String(e)));
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsuarios() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, primer_nombre, apellido_paterno");
    if (error) {
      toastError("Error al cargar usuarios: " + error.message);
      return;
    }
    setUsuarios(data || []);
  }

  async function actualizarSolicitud(soporte) {
    const { id, estado, respondida, atendida_por, fecha_resolucion, solucion } =
      soporte;

    const nuevoEstado =
      respondida && fecha_resolucion && solucion ? "Solucionada" : estado;

    const { error } = await supabase
      .from("soporte")
      .update({
        estado: nuevoEstado,
        respondida,
        atendida_por,
        fecha_resolucion,
        solucion,
      })
      .eq("id", id);

    if (error) {
      toastError("Error al actualizar: " + error.message);
    } else {
      toastSuccess("Solicitud actualizada");
      fetchSoportes();
    }
  }

  const estadosDisponibles = ["Pendiente", "En atención", "Solucionada"];

  // Filtro por estado o prioridad
  const soportesFiltrados = (soportes || []).filter(
    (s) =>
      (s.estado || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase()) ||
      (s.prioridad || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase())
  );

  // Paginación: 5 por página sobre el arreglo filtrado
  const {
    page,
    setPage,
    total,
    totalPages,
    start,
    end,
    pageItems, // usar en el <tbody>
  } = usePageSlice(soportesFiltrados, 5);

  // Al cambiar la búsqueda o el total filtrado, volver a página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, soportesFiltrados.length, setPage]);

  return (
    <div className="min-h-screen bg-blue text-white">
      <WorkBar />

      <h1 className="text-4xl text-yellow text-center font-bold mt-28 mb-8">
        Gestión de Soporte Técnico
      </h1>

      {/* Barra de búsqueda con botón hexagonal decorativo */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto px-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por estado o prioridad"
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

      <div className="overflow-x-auto w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4">
        <table className="min-w-full bg-white text-blue border border-gray-300 mb-4 text-xs sm:text-sm">
          <thead className="bg-yellow text-blue uppercase text-xs">
            <tr>
              <th className="px-2 sm:px-4 py-2 whitespace-nowrap">Fecha</th>
              <th className="px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                Asunto
              </th>
              <th className="px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                Usuario
              </th>
              <th className="px-2 sm:px-4 py-2">Prioridad</th>
              <th className="px-2 sm:px-4 py-2">Estado</th>
              <th className="px-2 sm:px-4 py-2 max-w-[7rem] whitespace-normal text-center align-middle">
                Respondida
              </th>
              <th className="px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                Atendida
                <br className="hidden sm:block" /> por
              </th>
              <th className="px-2 sm:px-4 py-2 max-w-[8rem] whitespace-normal text-center align-middle">
                Resolución
              </th>
              <th className="px-2 sm:px-4 py-2 max-w-[10rem] whitespace-normal text-center align-middle">
                Solución
              </th>
              <th className="px-2 sm:px-4 py-2 whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  Cargando solicitudes...
                </td>
              </tr>
            ) : pageItems.length > 0 ? (
              pageItems.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    {new Date(s.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    {s.asunto}
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    {s.usuarios
                      ? `${s.usuarios.primer_nombre} ${s.usuarios.apellido_paterno}`
                      : "—"}
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle">
                    {s.prioridad}
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle">
                    <select
                      value={s.estado || "Pendiente"}
                      onChange={(e) =>
                        setSoportes((prev) =>
                          prev.map((sol) =>
                            sol.id === s.id
                              ? { ...sol, estado: e.target.value }
                              : sol
                          )
                        )
                      }
                      className="border rounded px-2 py-1 w-full"
                    >
                      {estadosDisponibles.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={s.respondida || false}
                      onChange={(e) =>
                        setSoportes((prev) =>
                          prev.map((sol) =>
                            sol.id === s.id
                              ? { ...sol, respondida: e.target.checked }
                              : sol
                          )
                        )
                      }
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    <select
                      value={s.atendida_por || ""}
                      onChange={(e) =>
                        setSoportes((prev) =>
                          prev.map((sol) =>
                            sol.id === s.id
                              ? { ...sol, atendida_por: e.target.value }
                              : sol
                          )
                        )
                      }
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value="">—</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.primer_nombre} {u.apellido_paterno}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    <input
                      type="date"
                      value={s.fecha_resolucion?.split("T")[0] || ""}
                      onChange={(e) =>
                        setSoportes((prev) =>
                          prev.map((sol) =>
                            sol.id === s.id
                              ? { ...sol, fecha_resolucion: e.target.value }
                              : sol
                          )
                        )
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 align-middle max-w-xs truncate">
                    <textarea
                      value={s.solucion || ""}
                      onChange={(e) =>
                        setSoportes((prev) =>
                          prev.map((sol) =>
                            sol.id === s.id
                              ? { ...sol, solucion: e.target.value }
                              : sol
                          )
                        )
                      }
                      rows={2}
                      className="border rounded px-2 py-1 w-full resize-none"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-2 text-center align-middle">
                    <button
                      onClick={() => actualizarSolicitud(s)}
                      className="bg-orange text-white px-3 py-1 rounded hover:bg-yellow hover:text-blue"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación (5 por página) */}
      {!loading && soportesFiltrados.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          start={start}
          end={end}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}
