"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";
import { FaTrash, FaEdit } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

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
      const lower = term.toLowerCase();
      setFilteredUsuarios(
        usuarios.filter((u) => u.apellido_paterno.toLowerCase().includes(lower))
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
      toast.error("Error al eliminar usuario.");
    } else {
      toast.success("Usuario eliminado correctamente.");
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
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Lista de Usuarios
        </h1>

        {/* Búsqueda con botón limpiar */}
        <div className="flex gap-2 max-w-screen-lg mx-auto px-4 mb-2">
          <input
            type="text"
            placeholder="Buscar por apellido paterno"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white placeholder-gray-400"
          />
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
        {/* Mensaje contextual */}
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
                <th className="border px-4 py-2">Id Usuario</th>
                <th className="border px-4 py-2">Primer Nombre</th>
                <th className="border px-4 py-2">Segundo Nombre</th>
                <th className="border px-4 py-2">Apellido Paterno</th>
                <th className="border px-4 py-2">Apellido Materno</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Teléfono</th>
                <th className="border px-4 py-2">Justificación</th>
                <th className="border px-4 py-2">Rol</th>
                <th className="border px-4 py-2">Es Autor</th>
                <th className="border px-4 py-2">Foto</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="border px-4 py-2">{usuario.id}</td>
                  <td className="border px-4 py-2">{usuario.primer_nombre}</td>
                  <td className="border px-4 py-2">{usuario.segundo_nombre}</td>
                  <td className="border px-4 py-2">
                    {usuario.apellido_paterno}
                  </td>
                  <td className="border px-4 py-2">
                    {usuario.apellido_materno}
                  </td>
                  <td className="border px-4 py-2">{usuario.email}</td>
                  <td className="border px-4 py-2">{usuario.telefono}</td>
                  <td className="border px-4 py-2">{usuario.justificacion}</td>
                  <td className="border px-4 py-2">{usuario.role}</td>
                  <td className="border px-4 py-2">
                    {usuario.es_autor ? "Sí" : "No"}
                  </td>
                  <td className="border px-4 py-2">{usuario.foto}</td>
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
