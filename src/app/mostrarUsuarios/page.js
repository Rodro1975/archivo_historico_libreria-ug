"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { toastSuccess, toastError } from "@/lib/toastUtils";

// 👇 imports para paginación
import usePageSlice from "@/hooks/usePageSlice";
import Pagination from "@/components/Pagination";

const MostrarUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  // Función para obtener los usuarios desde Supabase
  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) {
      setError(error.message);
      setUsuarios([]);
      setFilteredUsuarios([]);
    } else {
      setUsuarios(data || []);
      setFilteredUsuarios(data || []);
    }
    setLoading(false);
  };

  // Función de búsqueda
  const handleSearch = useCallback(
    (term) => {
      const lower = (term || "").toLowerCase();
      setFilteredUsuarios(
        (usuarios || []).filter((u) =>
          (u.apellido_paterno || "").toLowerCase().includes(lower)
        )
      );
    },
    [usuarios]
  );

  // Filtrar al cambiar searchTerm
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // Carga inicial de usuarios y suscripción realtime
  useEffect(() => {
    fetchUsuarios();

    // Suscripción Realtime a cambios en usuarios
    const subscription = supabase
      .channel("usuarios_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "usuarios" },
        () => {
          // recargar lista al detectar cambios
          fetchUsuarios();
        }
      )
      .subscribe();

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // ✅ Paginación sobre la lista filtrada
  const {
    page,
    setPage,
    total,
    totalPages,
    start,
    end,
    pageItems, // <- usar en el tbody
  } = usePageSlice(filteredUsuarios, 5); // 5por página

  // ✅ Volver a la página 1 si cambia el término de búsqueda o cambia el total
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filteredUsuarios.length, setPage]);

  // Función para eliminar un usuario
  const handleDelete = async () => {
    if (!userToDelete) return;

    const { error } = await supabase.rpc("eliminar_usuario", {
      user_id: userToDelete.id,
    });

    if (error) {
      toastError("Error al eliminar usuario.");
    } else {
      toastSuccess("Usuario eliminado correctamente.");
      fetchUsuarios();
    }

    setUserToDelete(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <div className="min-h-screen bg-blue">
        <WorkBar />
        <h1 className="text-4xl text-yellow text-center font-bold mt-28 mb-8">
          Lista de Usuarios
        </h1>

        {/* Barra de búsqueda amarilla con hexágono y botón limpiar */}
        <div className="flex items-center gap-2 max-w-screen-lg mx-auto px-4 mb-2">
          <input
            type="text"
            placeholder="Buscar por apellido paterno"
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
              title="Limpiar búsqueda"
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

        {searchTerm && (
          <p className="text-sm text-gray-500 text-center mb-2">
            Haz clic en Limpiar para ver todos los usuarios.
          </p>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto w-full max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4">
          <table className="min-w-full bg-white border border-gray-300 text-blue mb-8 text-xs sm:text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs">
              <tr>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap align-middle">
                  ID
                </th>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap align-middle">
                  Rol
                </th>
                <th className="border px-2 sm:px-4 py-2 max-w-xs truncate whitespace-nowrap align-middle">
                  Apellido Paterno
                </th>
                <th className="border px-2 sm:px-4 py-2 max-w-xs truncate whitespace-nowrap align-middle">
                  Primer Nombre
                </th>
                <th className="border px-2 sm:px-4 py-2 max-w-xs truncate whitespace-nowrap align-middle">
                  Correo
                </th>
                <th className="border px-2 sm:px-4 py-2 whitespace-nowrap align-middle">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="border px-2 sm:px-4 py-2 align-middle">
                      {usuario.id}
                    </td>
                    <td className="border px-2 sm:px-4 py-2 align-middle">
                      {usuario.role ?? "—"}
                    </td>
                    <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                      {usuario.apellido_paterno ?? "—"}
                    </td>
                    <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                      {usuario.primer_nombre ?? "—"}
                    </td>
                    <td className="border px-2 sm:px-4 py-2 max-w-xs truncate align-middle">
                      {usuario.email ?? "—"}
                    </td>
                    <td className="border px-2 sm:px-4 py-2 align-middle">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => {
                            setCurrentUsuario(usuario);
                            setIsEditing(true);
                          }}
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-md border border-amber-500/70 bg-transparent px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-700 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors"
                          title="Modificar usuario"
                        >
                          <FaEdit />
                          <span className="hidden sm:inline">Modificar</span>
                        </button>
                        <button
                          onClick={() => setUserToDelete(usuario)}
                          className="inline-flex items-center gap-1 sm:gap-2 rounded-md border border-red-600/70 bg-transparent px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30 transition-colors"
                          title="Eliminar usuario"
                        >
                          <FaTrash />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center py-4" colSpan={6}>
                    No se encontraron usuarios
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
            totalPages={totalPages}
            total={total}
            start={start}
            end={end}
            onPageChange={(p) => setPage(p)}
          />
        </div>

        {/* Modal de confirmación */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4 text-red-700">
                ¿Eliminar usuario?
              </h2>
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                <strong>
                  {userToDelete.primer_nombre} {userToDelete.apellido_paterno}
                </strong>
                ?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {isEditing && currentUsuario && (
          <ActualizarUsuarios
            usuario={currentUsuario}
            onClose={() => {
              setIsEditing(false);
              setCurrentUsuario(null);
            }}
            onUpdate={() => {
              fetchUsuarios();
              setIsEditing(false);
              setCurrentUsuario(null);
            }}
          />
        )}
      </div>
    </Suspense>
  );
};

export default MostrarUsuariosPage;
