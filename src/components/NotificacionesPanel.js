// src/components/NotificacionesModal.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import supabase from "@/lib/supabase";
import { AiOutlineDelete, AiOutlineClose } from "react-icons/ai";

export default function NotificacionesModal({ open, onClose, role }) {
  const [mounted, setMounted] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // montar portal en client
  useEffect(() => setMounted(true), []);

  // ESC + lock scroll
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setNotificaciones([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("notificaciones")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filtro por rol (igual que en Sidebar)
    if (role === "Administrador") {
      query = query.in("type", ["usuarios", "libros", "autores"]);
    } else if (role === "Editor") {
      query = query.in("type", ["libros", "autores"]);
    }

    const { data, error } = await query;
    if (!error && data) setNotificaciones(data);
    setLoading(false);
  }, [role]);

  // Cargar al abrir
  useEffect(() => {
    if (open) fetchNotificaciones();
  }, [open, fetchNotificaciones]);

  // Realtime por rol
  useEffect(() => {
    if (!open) return;
    let channel;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const filter =
        role === "Administrador"
          ? "type=in.(usuarios,libros,autores)"
          : role === "Editor"
          ? "type=in.(libros,autores)"
          : ""; // lector u otros

      channel = supabase
        .channel("notificaciones-modal")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notificaciones",
            filter,
          },
          (payload) => {
            const n = payload.new;
            if (n.user_id !== user.id) return;
            setNotificaciones((prev) => [n, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notificaciones",
            filter,
          },
          (payload) => {
            const n = payload.new;
            if (n.user_id !== user.id) return;
            setNotificaciones((prev) =>
              prev.map((x) => (x.id === n.id ? n : x))
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notificaciones",
            filter,
          },
          (payload) => {
            const old = payload.old;
            if (old.user_id !== user.id) return;
            setNotificaciones((prev) => prev.filter((x) => x.id !== old.id));
            setSelected((prev) => prev.filter((id) => id !== old.id));
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [open, role]);

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = (checked) =>
    checked ? setSelected(notificaciones.map((n) => n.id)) : setSelected([]);

  const marcarSeleccionadasLeidas = async () => {
    if (selected.length === 0) return;
    const { error } = await supabase
      .from("notificaciones")
      .update({ read: true })
      .in("id", selected);
    if (!error) {
      setNotificaciones((prev) =>
        prev.map((n) => (selected.includes(n.id) ? { ...n, read: true } : n))
      );
    }
  };

  const marcarUnaLeida = async (id) => {
    const { error } = await supabase
      .from("notificaciones")
      .update({ read: true })
      .eq("id", id);
    if (!error) {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const eliminarSeleccionadas = async () => {
    if (selected.length === 0) return;
    const { error } = await supabase
      .from("notificaciones")
      .delete()
      .in("id", selected);
    if (!error) {
      setNotificaciones((prev) => prev.filter((n) => !selected.includes(n.id)));
      setSelected([]);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal centrado */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notificacionesTitle"
        className="relative z-[201] flex items-center justify-center w-full h-full px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-3xl">
          {/* Header */}
          <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-lg">
            <h3
              id="notificacionesTitle"
              className="text-lg font-bold text-blue"
            >
              Notificaciones
            </h3>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 rounded hover:bg-gray-200"
            >
              <AiOutlineClose className="text-blue" size={18} />
            </button>
          </div>

          {/* Controles */}
          <div className="px-4 py-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-blue">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={
                  notificaciones.length > 0 &&
                  selected.length === notificaciones.length
                }
                onChange={(e) => toggleAll(e.target.checked)}
              />
              Seleccionar todas
            </label>

            <button
              onClick={marcarSeleccionadasLeidas}
              disabled={selected.length === 0}
              className="text-sm text-blue disabled:opacity-50 underline"
            >
              Marcar seleccionadas como leídas
            </button>
          </div>

          {/* Lista (scroll interno) */}
          <div className="px-4 pb-4 max-h-[65vh] overflow-y-auto">
            {loading ? (
              <p className="text-gray-600">Cargando…</p>
            ) : notificaciones.length === 0 ? (
              <p className="text-gray-600">No hay notificaciones</p>
            ) : (
              <ul className="space-y-1">
                {notificaciones.map((n) => (
                  <li
                    key={n.id}
                    className={`py-2 border-b border-gray-200 last:border-b-0 flex items-start justify-between ${
                      n.read ? "text-gray-500" : "font-semibold"
                    }`}
                  >
                    <label className="flex items-start gap-2 flex-1 pr-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={selected.includes(n.id)}
                        onChange={() => toggleOne(n.id)}
                      />
                      <div className="min-w-0">
                        <p className="break-words text-blue">{n.message}</p>
                        {n.created_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </label>

                    {!n.read && (
                      <button
                        onClick={() => marcarUnaLeida(n.id)}
                        className="ml-2 text-[var(--color-gold)] text-xs whitespace-nowrap"
                      >
                        Marcar leída
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-3 rounded-b-lg">
            <button
              onClick={eliminarSeleccionadas}
              disabled={selected.length === 0}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <AiOutlineDelete size={16} />
              Eliminar seleccionadas
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
