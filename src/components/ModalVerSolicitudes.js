"use client";

import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabase";
import Image from "next/image";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import EditorialLogo from "./EditorialLogo";

export default function ModalVerSolicitudes({ open, onClose }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lectorId, setLectorId] = useState(null);
  const hasShownToast = useRef(false); //  Evita toast duplicado

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toastError("Inicia sesión para ver tus solicitudes");
        setLoading(false);
        return;
      }

      setLectorId(user.id);

      const { data, error } = await supabase
        .from("solicitudes")
        .select("id, tipo, detalle, estado, respuesta, creado_en")
        .eq("lector_id", user.id)
        .order("creado_en", { ascending: false });

      if (error) {
        toastError("Error al cargar solicitudes");
        setLoading(false);
      } else {
        setSolicitudes(data);
        if (!hasShownToast.current) {
          toastSuccess("Solicitudes cargadas correctamente");
          hasShownToast.current = true;
        }
        setLoading(false);
      }
    };

    if (open) {
      obtenerSolicitudes();
      hasShownToast.current = false; // Reinicia el control al reabrir modal
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center bg-blue text-yellow px-6 py-4">
          <div className="flex items-center gap-4">
            <EditorialLogo
              className="shrink-0"
              imageClassName="h-10 md:h-12 w-auto" // ~20% más chico
              priority
            />
            <h2 className="text-xl font-bold">
              Seguimiento de tus Solicitudes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-yellow hover:text-gold text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <p className="text-blue text-center font-semibold">Cargando...</p>
          ) : solicitudes.length === 0 ? (
            <p className="text-center text-blue-800 font-medium">
              No tienes solicitudes registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-yellow rounded-lg">
                <thead className="bg-yellow text-blue">
                  <tr>
                    <th className="p-2 text-left text-sm font-bold">#</th>
                    <th className="p-2 text-left text-sm font-bold">Tipo</th>
                    <th className="p-2 text-left text-sm font-bold">Detalle</th>
                    <th className="p-2 text-left text-sm font-bold">Estado</th>
                    <th className="p-2 text-left text-sm font-bold">
                      Respuesta
                    </th>
                    <th className="p-2 text-left text-sm font-bold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud, index) => (
                    <tr
                      key={solicitud.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                    >
                      <td className="p-2 text-sm text-blue">{index + 1}</td>
                      <td className="p-2 text-sm text-blue">
                        {solicitud.tipo}
                      </td>
                      <td className="p-2 text-sm text-blue whitespace-pre-wrap">
                        {solicitud.detalle}
                      </td>
                      <td
                        className={`p-2 text-sm font-bold ${
                          solicitud.estado === "aprobado"
                            ? "text-aprobado"
                            : solicitud.estado === "rechazado"
                            ? "text-rechazado"
                            : "text-pendiente"
                        }`}
                      >
                        {solicitud.estado || "Pendiente"}
                      </td>
                      <td className="p-2 text-sm text-blue whitespace-pre-wrap">
                        {solicitud.respuesta || "Sin respuesta aún"}
                      </td>
                      <td className="p-2 text-sm text-blue">
                        {new Date(solicitud.creado_en).toLocaleDateString(
                          "es-CO",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
