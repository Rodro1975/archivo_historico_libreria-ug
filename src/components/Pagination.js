"use client";
import { useMemo } from "react";

/**
 * Paginador sobrio (ghost azul).
 * Muestra un rango de páginas con “…” si son muchas.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  start,
  end,
  onPageChange,
  className = "",
}) {
  // Ventana de números (compacta con elipsis si hay muchas páginas)
  const pages = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const arr = new Set([
      1,
      2,
      totalPages - 1,
      totalPages,
      page - 1,
      page,
      page + 1,
    ]);
    // Limpia fuera de rango
    const norm = [...arr]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    // Inserta “…” donde haya saltos
    const withDots = [];
    for (let i = 0; i < norm.length; i++) {
      withDots.push(norm[i]);
      if (i < norm.length - 1 && norm[i + 1] - norm[i] > 1) withDots.push("…");
    }
    return withDots;
  }, [page, totalPages]);

  const btnBase =
    "inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors";
  const btnGhost =
    "border-blue-600/70 text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30";
  const btnDisabled = "border-neutral-300 text-neutral-400 cursor-not-allowed";

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-sm text-neutral-600">
        Mostrando{" "}
        <strong>
          {total === 0 ? 0 : start}–{end}
        </strong>{" "}
        de <strong>{total}</strong>
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnGhost}`}
        >
          Anterior
        </button>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`dots-${idx}`} className="px-2 text-neutral-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${btnBase} ${
                p === page
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : btnGhost
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={`${btnBase} ${
            page === totalPages ? btnDisabled : btnGhost
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
