"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarUsuarios from "@/components/ActualizarUsuarios";

const MostrarUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Carga inicial de usuarios
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
  const handleDelete = async (id_usuario) => {
    if (!window.confirm(`¿Eliminar usuario ${id_usuario}?`)) return;
    const { error } = await supabase.rpc("eliminar_usuario", {
      user_id: id_usuario,
    });
    if (error) {
      console.error("Error al eliminar usuario:", error.message);
      return;
    }
    console.log("Usuario eliminado correctamente.");
    fetchUsuarios();
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <div className="min-h-screen bg-blue">
        <WorkBar />
        <h1 className="text-4xl text-yellow text-center font-bold my-8">
          Lista de Usuarios
        </h1>

        {/* Búsqueda */}
        <div className="max-w-screen-lg mx-auto px-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por apellido paterno"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white placeholder-gray-400"
          />
        </div>

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
                      onClick={() => handleDelete(usuario.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUsuario(usuario);
                        setIsEditing(true);
                      }}
                      className="bg-yellow text-white px-4 py-1 rounded"
                    >
                      Modificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
