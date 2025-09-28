"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import { toastSuccess, toastError } from "@/lib/toastUtils";

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
    } else {
      setUsuarios(data);
      setFilteredUsuarios(data);
    }
    setLoading(false);
  };

  // Función de búsqueda
  const handleSearch = useCallback(
    (term) => {
      const lower = (term || "").toLowerCase();
      setFilteredUsuarios(
        usuarios.filter((u) =>
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
          console.log("Cambio en usuarios detectado, recargando lista...");
          fetchUsuarios();
        }
      )
      .subscribe();

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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
        <div className="overflow-x-auto w-full max-w-screen-lg mx-auto px-4">
          <table className="min-w-full bg-white border border-gray-300 text-blue mb-8">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Rol</th>
                <th className="border px-4 py-2">Apellido Paterno</th>
                <th className="border px-4 py-2">Primer Nombre</th>
                <th className="border px-4 py-2">Correo</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="border px-4 py-2">{usuario.id}</td>
                  <td className="border px-4 py-2">{usuario.role ?? "—"}</td>
                  <td className="border px-4 py-2">
                    {usuario.apellido_paterno ?? "—"}
                  </td>
                  <td className="border px-4 py-2">
                    {usuario.primer_nombre ?? "—"}
                  </td>
                  <td className="border px-4 py-2">{usuario.email ?? "—"}</td>
                  <td className="border px-4 py-2 space-y-2">
                    <button
                      onClick={() => setUserToDelete(usuario)}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg text-white px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                    >
                      <FaTrash />
                      Eliminar
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUsuario(usuario);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 bg-gold hover:bg-yellow shadow-md hover:shadow-lg text-blue-900 px-5 py-2 rounded-lg transition duration-300 cursor-pointer select-none"
                    >
                      <FaEdit />
                      Modificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de confirmacion */}
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
