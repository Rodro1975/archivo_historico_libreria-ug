"use client";

import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import Footer from "@/components/Footer";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";

export default function MostrarSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      toastError("Error al cargar solicitudes", toastStyle);
    } else {
      setSolicitudes(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFiltered(solicitudes);
    } else {
      setFiltered(
        solicitudes.filter((s) =>
          (s.estado || "pendiente").toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, solicitudes]);

  const actualizarSolicitud = async (estado) => {
    setLoading(true);
    const { error } = await supabase
      .from("solicitudes")
      .update({
        estado,
        respuesta: respuesta || null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", selected.id);

    setLoading(false);

    if (error) {
      toastError("No se pudo actualizar la solicitud", toastStyle);
    } else {
      toastSuccess("Solicitud actualizada", toastStyle);
      setSelected(null);
      setRespuesta("");
      fetchSolicitudes();
    }
  };

  return (
    <div>
      <WorkBar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Gestión de Solicitudes de Lectores
        </h1>
        {/* Barra de búsqueda */}
        <div className="mb-6 flex items-center justify-center">
          <div className="w-full max-w-md flex items-center">
            <input
              type="text"
              placeholder="Buscar por estado (pendiente, aprobado, rechazado)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A] text-gray-700"
            />
            <button
              className="ml-2 w-12 h-12 bg-[#FFC107] text-[#1E3A8A] flex items-center justify-center transform rotate-30 clip-hexagon"
              disabled
            >
              <div className="w-full h-full flex items-center justify-center -rotate-30">
                <FaSearch className="text-[#1E3A8A]" />
              </div>
            </button>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded"
                title="Limpiar búsqueda"
              >
                Limpiar
              </button>
            )}
          </div>
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

        {filtered.length === 0 ? (
          <p className="text-center text-blue">
            No hay solicitudes registradas.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-yellow">
            <table className="min-w-full divide-y divide-blue text-blue text-sm">
              <thead className="bg-yellow text-blue uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Detalle</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-200 hover:bg-yellow/20 transition"
                  >
                    <td className="px-4 py-3">{s.nombre}</td>
                    <td className="px-4 py-3">{s.tipo}</td>
                    <td className="px-4 py-3">{s.detalle}</td>
                    <td className="px-4 py-3 font-semibold">
                      {s.estado || "Pendiente"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(s.creado_en).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelected(s);
                          setRespuesta(s.respuesta || "");
                        }}
                        className="bg-blue text-white px-3 py-1 rounded-lg hover:bg-yellow transition"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de gestión */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full border-4 border-yellow">
            <h2 className="text-2xl font-bold mb-4 text-blue">
              Solicitud de {selected.tipo}
            </h2>
            <p className="mb-2 text-blue">
              <strong>Nombre:</strong> {selected.nombre}
            </p>
            <p className="mb-2 text-blue">
              <strong>Detalle:</strong> {selected.detalle}
            </p>

            <label className="block text-blue mt-4 mb-1 font-semibold">
              Responder:
            </label>
            <textarea
              className="w-full border border-yellow rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-gold text-blue text-sm"
              rows="4"
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
            />

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => actualizarSolicitud("aprobado")}
                className="bg-blue text-white px-4 py-2 rounded-lg hover:bg-gold transition"
                disabled={loading}
              >
                Aprobar
              </button>
              <button
                onClick={() => actualizarSolicitud("rechazado")}
                className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition"
                disabled={loading}
              >
                Rechazar
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setRespuesta("");
                }}
                className="text-blue font-bold px-4 py-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
