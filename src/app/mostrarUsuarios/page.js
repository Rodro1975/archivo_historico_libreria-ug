"use client";

import { useEffect, useState, useCallback } from "react"; // Asegúrate de importar useCallback
import supabase from "@/lib/supabase";
import WorkBar from "@/components/WorkBar";
import ActualizarUsuarios from "@/components/ActualizarUsuarios"; // Asegúrate de importar el componente correcto
import { useRouter, useSearchParams } from "next/navigation";

const MostrarUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null); // Corregido

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // Función para obtener los datos de la tabla
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

  // Función para buscar usuarios en la tabla
  const handleSearch = useCallback((searchTerm) => {
    const lowerCaseTerm = searchTerm.toLowerCase();
    const results = usuarios.filter((usuario) =>
      usuario.apellido_paterno.toLowerCase().includes(lowerCaseTerm)
    );
    setFilteredUsuarios(results);
  }, [usuarios]); // Agrega usuarios como dependencia

  // Efecto para cargar los datos al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Efecto para manejar la búsqueda
  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setFilteredUsuarios(usuarios); // Mostrar todos los usuarios si no hay término de búsqueda
    }
  }, [searchTerm, usuarios, handleSearch]); // Agrega handleSearch aquí

  // Función para eliminar un registro
  const handleDelete = async (id_usuario) => {
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id_usuario", id_usuario);

    if (error) {
      console.error("Error al eliminar: ", error.message);
    } else {
      fetchUsuarios();
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-blue">
      <WorkBar />
      <h1 className="text-4xl text-yellow text-center font-bold mt-8 mb-8">
        Lista de Usuarios
      </h1>
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
              <th className="border px-4 py-2">Password</th>
              <th className="border px-4 py-2">Rol</th>
              <th className="border px-4 py-2">Foto</th>
              <th className="border px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td className="border px-4 py-2">{usuario.id_usuario}</td>
                <td className="border px-4 py-2">{usuario.primer_nombre}</td>
                <td className="border px-4 py-2">{usuario.segundo_nombre}</td>
                <td className="border px-4 py-2">{usuario.apellido_paterno}</td>
                <td className="border px-4 py-2">{usuario.apellido_materno}</td>
                <td className="border px-4 py-2">{usuario.email}</td>
                <td className="border px-4 py-2">{usuario.telefono}</td>
                <td className="border px-4 py-2">{usuario.justificacion}</td>
                <td className="border px-4 py-2">{usuario.password}</td>
                <td className="border px-4 py-2">{usuario.role}</td>
                <td className="border px-4 py-2">{usuario.foto}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleDelete(usuario.id_usuario)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => {
                      setCurrentUsuario(usuario); // Corregido
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

      {/* Modal para editar Usuario */}
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
  );
};

export default MostrarUsuariosPage;

