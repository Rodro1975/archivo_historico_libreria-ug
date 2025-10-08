"use client";
import { useMemo, useEffect, useState } from "react";

/**
 * Pagina un arreglo en cliente.
 * @param {Array} items - Datos ya filtrados/ordenados.
 * @param {number} pageSize - Ítems por página (default 5).
 */
export default function usePageSlice(items = [], pageSize = 5) {
  const [page, setPage] = useState(1);

  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Corrige página si te quedaste “fuera de rango” (ej. al borrar).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  const pageItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(start, end);
  }, [items, start, end]);

  return {
    page,
    setPage,
    total,
    totalPages,
    start: total === 0 ? 0 : start + 1, // 1-based para mostrar “X–Y de Z”
    end,
    pageItems,
    pageSize,
  };
}
