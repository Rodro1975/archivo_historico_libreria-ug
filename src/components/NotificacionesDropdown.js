"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";

const NotificacionesDropdown = ({ show, onClose }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div
      className={`absolute left-16 top-16 bg-white shadow-lg p-4 rounded w-72 ${
        show ? "block" : "hidden"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Notificaciones</h3>
        <button onClick={onClose} className="text-gray-500 text-sm">
          ✕
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-gray-500">No hay notificaciones</p>
      ) : (
        <ul className="mt-2">
          {notificaciones.map((n) => (
            <li
              key={n.id}
              className={`p-2 border-b ${
                n.read ? "text-gray-500" : "font-bold"
              }`}
            >
              {n.message}
              {!n.read && (
                <button
                  onClick={() => marcarComoLeida(n.id)}
                  className="ml-2 text-blue text-xs"
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificacionesDropdown;
