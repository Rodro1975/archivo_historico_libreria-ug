"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { AiOutlineCheck, AiOutlineDelete } from "react-icons/ai";

const NotificacionesDropdown = ({ show, onClose }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Obtener las notificaciones del usuario autenticado
  useEffect(() => {
    if (!show) return;

    const fetchNotificaciones = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setNotificaciones(data);
      }
      setLoading(false);
    };

    fetchNotificaciones();
  }, [show]);

  // Marcar notificación como leída
  const marcarComoLeida = async (id) => {
    await supabase.from("notificaciones").update({ read: true }).eq("id", id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Toggle para seleccionar/deseleccionar notificaciones
  const toggleSelect = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  // Eliminar notificaciones seleccionadas
  const eliminarSeleccionadas = async () => {
    if (selectedNotifications.length === 0) return;

    const { data, error } = await supabase
      .from("notificaciones")
      .delete()
      .in("id", selectedNotifications);

    if (error) {
      console.error("Error al eliminar notificaciones:", error);
      return;
    }

    // Actualizar la lista de notificaciones
    setNotificaciones((prev) =>
      prev.filter((n) => !selectedNotifications.includes(n.id))
    );

    // Limpiar la selección
    setSelectedNotifications([]);
  };

  return (
    <div
      className={`absolute left-0 mt-2 w-72 max-w-xs bg-white shadow-lg p-4 rounded z-50 ${
        show ? "block" : "hidden"
      }`}
      style={{ minWidth: "16rem" }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-orange">Notificaciones</h3>
        <button onClick={onClose} className="text-gray-500 text-sm">
          ✕
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-gray-500">No hay notificaciones</p>
      ) : (
        <>
          {/* Selector global y botón para marcar como leídas */}
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={
                  notificaciones.length > 0 &&
                  selectedNotifications.length === notificaciones.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedNotifications(notificaciones.map((n) => n.id));
                  } else {
                    setSelectedNotifications([]);
                  }
                }}
                className="form-checkbox h-4 w-4 text-gold rounded"
              />
              <span className="text-sm text-gray-600">Seleccionar todas</span>
            </label>

            {selectedNotifications.length > 0 && (
              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from("notificaciones")
                    .update({ read: true })
                    .in("id", selectedNotifications);

                  if (!error) {
                    setNotificaciones((prev) =>
                      prev.map((n) =>
                        selectedNotifications.includes(n.id)
                          ? { ...n, read: true }
                          : n
                      )
                    );
                  }
                }}
                className="text-xs text-gold hover:underline"
              >
                Marcar seleccionadas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <ul className="mt-2 max-h-[100px] overflow-y-auto">
            {notificaciones.map((n) => (
              <li
                key={n.id}
                className={`p-2 border-b last:border-b-0 flex items-center justify-between ${
                  n.read ? "text-gray-500" : "font-bold"
                } break-words whitespace-normal max-w-full`}
                style={{ wordBreak: "break-word" }}
              >
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(n.id)}
                    onChange={() => toggleSelect(n.id)}
                    className="form-checkbox h-4 w-4 text-gold rounded"
                  />
                  <span>{n.message}</span>
                </label>
                {!n.read && (
                  <button
                    onClick={() => marcarComoLeida(n.id)}
                    className="ml-2 text-gold text-xs"
                  >
                    Marcar como leída
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Botón para eliminar seleccionadas */}
          <button
            onClick={eliminarSeleccionadas}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-700 flex items-center space-x-2"
            disabled={selectedNotifications.length === 0}
          >
            <AiOutlineDelete size={16} />
            <span>Eliminar seleccionadas</span>
          </button>
        </>
      )}
    </div>
  );
};

export default NotificacionesDropdown;
