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
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

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

  // Función de búsqueda que filtra los usuarios por apellido paterno
  const handleSearch = useCallback(
    (term) => {
      const lowerCaseTerm = term.toLowerCase();
      const results = usuarios.filter((usuario) =>
        usuario.apellido_paterno.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredUsuarios(results);
    },
    [usuarios]
  );

  // Actualizar los resultados de la búsqueda cuando cambia el término
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Función para eliminar un usuario
  const handleDelete = async (id_usuario) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario con ID: ${id_usuario}?`
    );

    if (!confirmar) return;

    // Llamar al procedimiento almacenado en Supabase (RPC)
    const { error } = await supabase.rpc("eliminar_usuario", {
      user_id: id_usuario,
    });

    if (error) {
      console.error("Error al eliminar usuario:", error.message);
      return;
    }

    console.log("Usuario eliminado correctamente de ambas tablas.");

    // Recargar la lista de usuarios
    fetchUsuarios();
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <div className="min-h-screen bg-blue">
        <WorkBar />
        <h1 className="text-4xl text-yellow text-center font-bold mt-8 mb-8">
          Lista de Usuarios
        </h1>

        {/* Barra de búsqueda */}
        <div className="max-w-screen-lg mx-auto px-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por apellido paterno"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-black bg-white placeholder-gray-400" // Asegura que el texto sea negro, el fondo blanco, y el placeholder tenga un color gris
          />
        </div>

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
                  <td className="border px-4 py-2">{usuario.foto}</td>
                  <td className="border px-4 py-2">
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
                      className="bg-yellow text-white px-4 py-1 rounded mt-2"
                    >
                      Modificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
