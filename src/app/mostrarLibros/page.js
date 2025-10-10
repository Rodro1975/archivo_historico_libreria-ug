"use client";

import { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarLibros from "@/components/ActualizarLibros";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import usePageSlice from "@/hooks/usePageSlice";
import Pagination from "@/components/Pagination";

// Helpers
const norm = (x) => (x ?? "").toString().toLowerCase().trim();
const getNombre = (row) => row?.autor?.nombre_completo || null;

// normaliza y deja solo letras (atrapa variantes: "Co-editor", "co editor", etc.)
const onlyLetters = (s) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .replace(/[^a-záéíóúüñ]/g, "");

// detecta coeditor de forma robusta
const isCoeditor = (tipo) => {
  const t = onlyLetters(tipo);
  return t === "coeditor" || t.includes("coeditor");
};

// detecta coautor de forma robusta (p. ej., "co-autor")
const isCoautor = (tipo) => {
  const t = onlyLetters(tipo);
  return t === "coautor" || t.includes("coautor");
};

const pickPrincipal = (rows = []) => {
  if (!rows.length) return null;
  // nunca elijas coeditor como principal
  const rowsNoCoed = rows.filter((r) => !isCoeditor(r?.tipo_autor));

  const by = (pred) => rowsNoCoed.find((r) => pred(norm(r?.tipo_autor || "")));
  const row =
    by((t) => t.includes("principal")) || // "autor principal", etc.
    by((t) => t === "autor") || // "autor"
    rowsNoCoed[0] || // primer no-coeditor
    rows[0]; // fallback extremo

  return getNombre(row);
};

// 👉 "Otros autores" = SOLO coautores (excluye principal por nombre)
const pickOtros = (rows = [], principal) => {
  const p = norm(principal);
  return rows
    .filter((r) => isCoautor(r?.tipo_autor)) // SOLO coautor
    .map(getNombre)
    .filter(Boolean)
    .filter((name) => norm(name) && norm(name) !== p);
};

// 👉 "Coeditores" = SOLO coeditores
const pickCoeditores = (rows = []) =>
  rows
    .filter((r) => isCoeditor(r?.tipo_autor))
    .map(getNombre)
    .filter(Boolean);

// mapFormato
const mapFormato = (l) => {
  const raw = (l?.formato ?? "").toString();
  const f = raw.toLowerCase().trim();
  if (!f) return "—";

  if (f === "impreso") return "Impreso";
  if (
    f === "impresión bajo demanda" ||
    f === "impresion bajo demanda" ||
    f === "ibd"
  ) {
    return "Impresión bajo demanda (IBD)";
  }
  if (
    f === "electrónico de acceso abierto" ||
    f === "electronico de acceso abierto" ||
    f === "ea" ||
    f === "acceso abierto"
  ) {
    return "Electrónico (acceso abierto)";
  }
  if (
    f === "electrónico comercial" ||
    f === "electronico comercial" ||
    f === "ec" ||
    f === "comercial"
  ) {
    return "Electrónico (comercial)";
  }

  // Compatibilidad con datos antiguos
  if (f === "electrónico" || f === "electronico") return "Electrónico";
  if (f === "ambos" || f === "mixto") return "Ambos";

  if (f === "otro") return "Otro";

  // Fallback seguro: muestra tal cual lo que venga
  return raw;
};

// Helpers de campos visibles
const anio = (l) => (l?.anioPublicacion ? String(l.anioPublicacion) : "—");
const paginas = (l) => (l?.numeroPaginas ? String(l.numeroPaginas) : "—");
const edicion = (l) => l?.numeroEdicion ?? "—";
const isbnUG = (l) => (l?.isbn ? l.isbn : "—"); // por ahora mapea "ISBN UG" -> isbn
const sinopsisCorta = (l) => {
  const s = l?.sinopsis?.trim();
  if (!s) return "—";
  return s.length > 180 ? `${s.slice(0, 180)}…` : s;
};

const MostrarLibrosPage = () => {
  const [libros, setLibros] = useState([]);
  const [filteredLibros, setFilteredLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLibro, setCurrentLibro] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Quita acentos y pasa a minúsculas
  const fold = (s) =>
    (s ?? "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Mapeos de autores
  const [principalMap, setPrincipalMap] = useState({}); // { id_libro: "Autor Principal" }
  const [otrosMap, setOtrosMap] = useState({}); // { id_libro: ["Autor 2", "Autor 3"] }
  const [coeditoresMap, setCoeditoresMap] = useState({}); // { id_libro: ["Coeditor 1", ...] }

  const fetchLibros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Libros
      const { data, error } = await supabase.from("libros").select("*");
      if (error) throw new Error(error.message);

      const librosData = data || [];
      setLibros(librosData);
      setFilteredLibros(librosData);

      // 2) Autores (un solo fetch)
      if (librosData.length) {
        const ids = librosData.map((l) => l.id_libro).filter(Boolean);

        const { data: la, error: e2 } = await supabase
          .from("libro_autor")
          .select("libro_id, tipo_autor, autor:autores ( nombre_completo )")
          .in("libro_id", ids);

        if (e2) throw new Error(e2.message);

        const byLibro = {};
        (la || []).forEach((row) => {
          (byLibro[row.libro_id] ||= []).push(row);
        });

        const pMap = {};
        const oMap = {};
        const cMap = {};

        ids.forEach((id) => {
          const rows = byLibro[id] || [];
          const p = pickPrincipal(rows);
          pMap[id] = p || "—";
          oMap[id] = pickOtros(rows, p);
          cMap[id] = pickCoeditores(rows);
        });

        setPrincipalMap(pMap);
        setOtrosMap(oMap);
        setCoeditoresMap(cMap);
      } else {
        setPrincipalMap({});
        setOtrosMap({});
        setCoeditoresMap({});
      }
    } catch (err) {
      console.error("Error al obtener libros:", err?.message || err);
      setError(err?.message || "Error al cargar libros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibros();
  }, [fetchLibros]);

  // ✅ Paginación sobre el arreglo filtrado (5 por página)
  const { page, setPage, total, totalPages, start, end, pageItems } =
    usePageSlice(filteredLibros, 5);

  // ✅ Si cambia el término de búsqueda, vuelve a la página 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, setPage]);

  // Búsqueda por título o subtítulo (insensible a acentos)
  useEffect(() => {
    const term = fold(searchTerm.trim());
    if (!term) {
      setFilteredLibros(libros);
      return;
    }
    const results = libros.filter((l) => {
      const t = fold(l?.titulo);
      const s = fold(l?.subtitulo);
      return t.includes(term) || s.includes(term);
    });
    setFilteredLibros(results);
  }, [searchTerm, libros]);

  const handleDelete = async (codigoRegistro) => {
    if (!codigoRegistro) {
      toastError("No se pudo eliminar: falta Código de Registro");
      return;
    }
    try {
      const { error } = await supabase
        .from("libros")
        .delete()
        .eq("codigoRegistro", codigoRegistro);
      if (error) throw new Error(error.message);
      await fetchLibros();
      toastSuccess("Libro eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar el libro:", err?.message || err);
      toastError("No se pudo eliminar el libro");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Cargando...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-200">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <WorkBar />
      <h1 className="text-4xl text-yellow text-center font-bold mt-28 mb-8">
        Lista de Libros
      </h1>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 max-w-screen-lg mx-auto px-4 mb-2">
        <input
          type="text"
          placeholder="Buscar por título o subtítulo"
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
        {searchTerm ? (
          <button
            onClick={() => setSearchTerm("")}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded"
            title="Limpiar búsqueda"
          >
            Limpiar
          </button>
        ) : null}
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

      {searchTerm ? (
        <p className="text-sm text-gray-300 text-center mb-2">
          Haz clic en Limpiar para ver todos los libros.
        </p>
      ) : null}

      <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
        <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
          <thead>
            <tr>
              <th className="border px-4 py-2">Código de Registro</th>
              <th className="border px-4 py-2">Título</th>
              <th className="border px-4 py-2">Subtítulo</th>
              <th className="border px-4 py-2">Autor principal</th>
              <th className="border px-4 py-2">Coautores</th>
              <th className="border px-4 py-2">Colección</th>
              <th className="border px-4 py-2">Edición</th>
              <th className="border px-4 py-2">Año</th>
              <th className="border px-4 py-2">Formatos</th>
              <th className="border px-4 py-2">Núm. páginas</th>
              <th className="border px-4 py-2">ISBN UG</th>
              <th className="border px-4 py-2">Tipo de autoría</th>
              <th className="border px-4 py-2">Coeditores</th>
              <th className="border px-4 py-2">Sinopsis</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredLibros.length > 0 ? (
              pageItems.map((libro, idx) => (
                <tr key={libro?.id_libro ?? libro?.codigoRegistro ?? idx}>
                  <td className="border px-4 py-2">
                    {libro?.codigoRegistro ?? "—"}
                  </td>
                  <td className="border px-4 py-2">{libro?.titulo ?? "—"}</td>
                  <td className="border px-4 py-2">
                    {libro?.subtitulo || "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {principalMap[libro?.id_libro] ?? "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {otrosMap[libro?.id_libro]?.length
                      ? otrosMap[libro?.id_libro].join("; ")
                      : "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {libro?.coleccion ?? "—"}
                  </td>
                  <td className="border px-4 py-2">{edicion(libro)}</td>
                  <td className="border px-4 py-2">{anio(libro)}</td>
                  <td className="border px-4 py-2">{mapFormato(libro)}</td>
                  <td className="border px-4 py-2">{paginas(libro)}</td>
                  <td className="border px-4 py-2">{isbnUG(libro)}</td>
                  <td className="border px-4 py-2">
                    {libro?.tipoAutoria ?? "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {coeditoresMap[libro?.id_libro]?.length
                      ? coeditoresMap[libro?.id_libro].join("; ")
                      : "—"}
                  </td>
                  <td className="border px-4 py-2">{sinopsisCorta(libro)}</td>
                  <td className="border px-4 py-2">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => {
                          setCurrentLibro(libro);
                          setIsEditing(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md border border-amber-500/70 bg-transparent px-4 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors"
                        title="Modificar libro"
                      >
                        <FaEdit />
                        Modificar
                      </button>
                      <button
                        onClick={() => {
                          setLibroAEliminar(libro);
                          setShowConfirm(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md border border-red-600/70 bg-transparent px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30 transition-colors"
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
                <td className="border px-4 py-6 text-center" colSpan={15}>
                  No se encontraron libros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      <div className="max-w-screen-lg mx-auto px-4 mb-10">
        <Pagination
          page={page}
          total={total}
          totalPages={totalPages}
          start={start}
          end={end}
          onPageChange={setPage} // 👈 antes estabas pasando setPage (prop equivocada)
          // className="opcional"
        />
      </div>

      {isEditing && currentLibro ? (
        <ActualizarLibros
          libro={currentLibro}
          onClose={() => {
            setIsEditing(false);
            setCurrentLibro(null);
          }}
          onUpdate={() => {
            fetchLibros();
            setIsEditing(false);
            setCurrentLibro(null);
          }}
        />
      ) : null}

      {/* Modal de confirmación */}
      {showConfirm ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <h2 className="text-lg font-semibold mb-4 text-red-700">
              ¿Eliminar libro?
            </h2>
            <p className="mb-6 text-gray-700">
              ¿Estás seguro de que deseas eliminar el libro{" "}
              <strong>{libroAEliminar?.titulo ?? "—"}</strong>? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  const codigo = libroAEliminar?.codigoRegistro ?? null;
                  setShowConfirm(false);
                  await handleDelete(codigo);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MostrarLibrosPage;
