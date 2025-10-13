// src/app/informes/dependenciaAcademica/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import { FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import WorkBar from "@/components/WorkBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function InformesDependenciaAcademica() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    dependencia: "",
  });

  useEffect(() => {
    const fetchRoleAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", user.id)
        .single();

      if (
        error ||
        !usuario ||
        (usuario.role !== "Editor" && usuario.role !== "Administrador")
      ) {
        toastError("Acceso restringido");
        router.push("/dashboard");
        return;
      }

      setUserRole("Editor");
      await cargarLibros();
    };

    fetchRoleAndData();
  }, [router]);

  const cargarLibros = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("libros").select(
      `id_libro, titulo,
        unidades_academicas:unidad_academica_id(
          nombre,
          dependencia_id,
          dependencias:dependencia_id(nombre)
        )`
    );

    if (error) {
      toastError("Error al cargar libros");
    } else {
      setLibros(data);
    }
    setLoading(false);
  };

  const librosFiltrados = useMemo(() => {
    return libros.filter((libro) => {
      const dependenciaNombre =
        libro.unidades_academicas?.dependencias?.nombre || "";
      const dependenciaMatch =
        !filtros.dependencia ||
        dependenciaNombre
          .toLowerCase()
          .includes(filtros.dependencia.toLowerCase());
      return dependenciaMatch;
    });
  }, [libros, filtros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Libros por Unidad Académica y Dependencia", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [["Título", "Unidad Académica", "Dependencia"]],
      body: librosFiltrados.map((libro) => [
        libro.titulo || "N/A",
        libro.unidades_academicas?.nombre || "N/A",
        libro.unidades_academicas?.dependencias?.nombre || "N/A",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("libros_unidades_dependencias.pdf");
    toastSuccess("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Libros UD");

    sheet.columns = [
      { header: "Título", key: "titulo", width: 30 },
      { header: "Unidad Académica", key: "unidad", width: 30 },
      { header: "Dependencia", key: "dependencia", width: 30 },
    ];

    librosFiltrados.forEach((libro) => {
      sheet.addRow({
        titulo: libro.titulo || "N/A",
        unidad: libro.unidades_academicas?.nombre || "N/A",
        dependencia: libro.unidades_academicas?.dependencias?.nombre || "N/A",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "libros_ud.xlsx");
    toastSuccess("Excel descargado correctamente");
  };

  if (!userRole) {
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
          Libros por Unidad Académica y Dependencia
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FiltroTexto
          value={filtros.dependencia}
          placeholder="Filtrar por dependencia"
          onChange={(v) => setFiltros({ ...filtros, dependencia: v })}
          onClear={() => setFiltros({ ...filtros, dependencia: "" })}
        />
      </div>
      {/* Botones de exportación */}
      <div className="flex justify-end gap-4 mb-4">
        <button
          onClick={exportarPDF}
          className="inline-flex items-center gap-2 rounded-md border border-[#D32F2F] bg-white px-5 py-2.5 text-sm font-semibold text-[#D32F2F] hover:bg-[rgba(211,47,47,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(211,47,47,0.35)] transition-colors"
        >
          <FaFilePdf className="text-[#D32F2F]" />
          PDF
        </button>

        <button
          onClick={exportarExcel}
          className="inline-flex items-center gap-2 rounded-md border border-[#107C41] bg-white px-5 py-2.5 text-sm font-semibold text-[#107C41] hover:bg-[rgba(16,124,65,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(16,124,65,0.35)] transition-colors"
        >
          <FaFileExcel className="text-[#107C41]" />
          Excel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-blue">Cargando libros...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Unidad Académica</th>
                <th className="px-4 py-3 text-left">Dependencia</th>
              </tr>
            </thead>
            <tbody>
              {librosFiltrados.length > 0 ? (
                librosFiltrados.map((libro) => (
                  <tr
                    key={libro.id_libro}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">{libro.titulo}</td>
                    <td className="px-4 py-3">
                      {libro.unidades_academicas?.nombre}
                    </td>
                    <td className="px-4 py-3">
                      {libro.unidades_academicas?.dependencias?.nombre}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-center text-blue">
                    No se encontraron libros con los filtros aplicados
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
