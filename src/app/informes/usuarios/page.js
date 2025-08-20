"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import WorkBar from "@/components/WorkBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";

function FiltroTexto({ value, placeholder, onChange, onClear }) {
  return (
    <div className="flex items-center w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-l p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A] text-gray-500"
      />
      <button
        className="ml-2 w-12 h-12 bg-orange text-blue flex items-center justify-center transform rotate-30 clip-hexagon"
        title="Buscar"
        tabIndex={-1}
        disabled
      >
        <div className="w-full h-full flex items-center justify-center -rotate-30">
          <FaSearch className="text-blue" />
        </div>
      </button>
      {value && (
        <button
          onClick={onClear}
          className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded"
          title="Limpiar filtro"
        >
          Limpiar
        </button>
      )}
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
    </div>
  );
}

export default function InformeUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);
  const [filtros, setFiltros] = useState({
    nombre: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const verificarAcceso = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !data || data.role !== "Administrador") {
        toastError("Acceso restringido");
        router.push("/dashboard");
        return;
      }

      setRol("Administrador");
      await cargarUsuarios();
    };

    verificarAcceso();
  }, [router]);

  const cargarUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select(
        `
        id,
        primer_nombre,
        segundo_nombre,
        apellido_paterno,
        apellido_materno,
        email,
        telefono,
        justificacion,
        fecha_creacion,
        fecha_modificacion,
        foto,
        role,
        es_autor
      `
      )
      .order("fecha_creacion", { ascending: false });

    if (error) {
      toastError("Error al cargar usuarios");
      console.error(error);
    } else {
      setUsuarios(data);
    }
    setLoading(false);
  };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const nombreCompleto = [
        u.primer_nombre,
        u.segundo_nombre,
        u.apellido_paterno,
        u.apellido_materno,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchNombre = nombreCompleto.includes(filtros.nombre.toLowerCase());
      const matchEmail = u.email
        ?.toLowerCase()
        .includes(filtros.email.toLowerCase());
      const matchRole = filtros.role
        ? u.role?.toLowerCase() === filtros.role.toLowerCase()
        : true;
      return matchNombre && matchEmail && matchRole;
    });
  }, [usuarios, filtros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Usuarios", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Nombre completo",
          "Email",
          "Teléfono",
          "Rol",
          "Es autor",
          "Fecha creación",
          "Fecha modificación",
        ],
      ],
      body: usuariosFiltrados.map((u) => [
        u.id.substring(0, 8) + "...",
        [
          u.primer_nombre,
          u.segundo_nombre,
          u.apellido_paterno,
          u.apellido_materno,
        ]
          .filter(Boolean)
          .join(" "),
        u.email,
        u.telefono || "N/A",
        u.role,
        u.es_autor ? "Sí" : "No",
        u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleDateString() : "",
        u.fecha_modificacion
          ? new Date(u.fecha_modificacion).toLocaleDateString()
          : "",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save("informe_usuarios.pdf");
    toastSuccess("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Usuarios");

    sheet.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "Nombre completo", key: "nombre", width: 40 },
      { header: "Email", key: "email", width: 30 },
      { header: "Teléfono", key: "telefono", width: 15 },
      { header: "Rol", key: "role", width: 15 },
      { header: "Es autor", key: "es_autor", width: 10 },
      { header: "Fecha creación", key: "fecha_creacion", width: 20 },
      { header: "Fecha modificación", key: "fecha_modificacion", width: 20 },
    ];

    usuariosFiltrados.forEach((u) => {
      sheet.addRow({
        id: u.id,
        nombre: [
          u.primer_nombre,
          u.segundo_nombre,
          u.apellido_paterno,
          u.apellido_materno,
        ]
          .filter(Boolean)
          .join(" "),
        email: u.email,
        telefono: u.telefono || "N/A",
        role: u.role,
        es_autor: u.es_autor ? "Sí" : "No",
        fecha_creacion: u.fecha_creacion
          ? new Date(u.fecha_creacion).toLocaleString()
          : "",
        fecha_modificacion: u.fecha_modificacion
          ? new Date(u.fecha_modificacion).toLocaleString()
          : "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "informe_usuarios.xlsx");
    toastSuccess("Excel descargado correctamente");
  };

  if (!rol) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue text-xl">Verificando permisos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <WorkBar />
      <div className="flex flex-col items-center justify-center mb-8">
        <Image
          src="/images/editorial-ug.png"
          alt="Editorial UG"
          width={160}
          height={160}
          className="mb-2"
        />
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Informe de Usuarios
        </h1>
      </div>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <FiltroTexto
          value={filtros.nombre}
          placeholder="Buscar por nombre"
          onChange={(v) => setFiltros({ ...filtros, nombre: v })}
          onClear={() => setFiltros({ ...filtros, nombre: "" })}
        />
        <FiltroTexto
          value={filtros.email}
          placeholder="Buscar por email"
          onChange={(v) => setFiltros({ ...filtros, email: v })}
          onClear={() => setFiltros({ ...filtros, email: "" })}
        />
        <div className="flex items-center w-full max-w-md mx-auto">
          <select
            value={filtros.role}
            onChange={(e) => setFiltros({ ...filtros, role: e.target.value })}
            className="p-2 border rounded-l flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] placeholder-[#1E3A8A] text-gray-500"
          >
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Editor">Editor</option>
            {/* Agrega más roles si existen */}
          </select>
          {filtros.role && (
            <button
              onClick={() => setFiltros({ ...filtros, role: "" })}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold px-3 py-2 rounded"
              title="Limpiar filtro"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Botones de exportar */}
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={exportarPDF}
          className="flex items-center gap-2 bg-orange text-gold font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-yellow"
        >
          <FaFilePdf className="text-gold group-hover:text-blue transition-colors" />
          <span className="text-gold group-hover:text-blue transition-colors">
            PDF
          </span>
        </button>
        <button
          onClick={exportarExcel}
          className="flex items-center gap-2 bg-orange text-gold font-bold px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 group border border-yellow"
        >
          <FaFileExcel className="text-gold group-hover:text-blue transition-colors" />
          <span className="text-gold group-hover:text-blue transition-colors">
            Excel
          </span>
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-blue">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nombre completo</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Es autor</th>
                <th className="px-4 py-3 text-left">Fecha creación</th>
                <th className="px-4 py-3 text-left">Fecha modificación</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {u.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {[
                        u.primer_nombre,
                        u.segundo_nombre,
                        u.apellido_paterno,
                        u.apellido_materno,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.telefono || "N/A"}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">{u.es_autor ? "Sí" : "No"}</td>
                    <td className="px-4 py-3">
                      {u.fecha_creacion
                        ? new Date(u.fecha_creacion).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      {u.fecha_modificacion
                        ? new Date(u.fecha_modificacion).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-blue">
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
