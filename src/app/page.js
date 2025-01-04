"use client";

import supabase from "@/lib/supabase"; // Ajusta el path si necesario
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("usuarios").select("*");

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id_auth}>
              {user.email} - {user.primer_nombre}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay usuarios.</p>
      )}
    </div>
  );
}

/**export default function Home() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <Link href="/login">Login ArchHist</Link>
    </div>
  );
} */
