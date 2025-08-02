"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import { Toaster, toast } from "react-hot-toast";
import { FaSearch } from "react-icons/fa";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

export default function MostrarSoportePage() {
  const [soportes, setSoportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSoportes();
    fetchUsuarios();
  }, []);

  async function fetchSoportes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("soporte")
      .select(
        "*, usuarios:usuario_id(primer_nombre, apellido_paterno), atendido:atendida_por(primer_nombre, apellido_paterno)"
      );

    if (error) {
      toast.error("Error al cargar soporte: " + error.message, toastStyle);
      return;
    }
    setSoportes(data);
    setLoading(false);
  }

  async function fetchUsuarios() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, primer_nombre, apellido_paterno");
    if (error) {
      toast.error("Error al cargar usuarios: " + error.message, toastStyle);
      return;
    }
    setUsuarios(data);
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
      toast.error("Error al actualizar: " + error.message, toastStyle);
    } else {
      toast.success("Solicitud actualizada", toastStyle);
      fetchSoportes();
    }
  }

  const estadosDisponibles = ["Pendiente", "En atención", "Solucionada"];

  const soportesFiltrados = soportes.filter(
    (s) =>
      s.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prioridad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue text-white">
      <WorkBar />
      <Toaster position="top-right" />

      <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
        Gestión de Soporte Técnico
      </h1>

      {/* Barra de búsqueda con botón hexagonal decorativo */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto px-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por estado o prioridad"
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

      <div className="overflow-x-auto max-w-6xl mx-auto px-4">
        <table className="min-w-full bg-white text-blue border border-gray-300 mb-8">
          <thead className="bg-gold text-blue-900">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Asunto</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Prioridad</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Respondida</th>
              <th className="px-4 py-2">Atendida por</th>
              <th className="px-4 py-2">Resolución</th>
              <th className="px-4 py-2">Solución</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-6">
                  Cargando solicitudes...
                </td>
              </tr>
            ) : soportesFiltrados.length > 0 ? (
              soportesFiltrados.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(s.fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{s.asunto}</td>
                  <td className="px-4 py-2">
                    {s.usuarios
                      ? `${s.usuarios.primer_nombre} ${s.usuarios.apellido_paterno}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">{s.prioridad}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2 text-center">
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
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
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
    </div>
  );
}
