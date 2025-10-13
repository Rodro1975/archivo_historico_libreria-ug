// src/app/informes/autoresFrecuentes/page.js
"use client";

import { useEffect, useState } from "react";
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

export default function InformesAutoresFrecuentes() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);

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
      await cargarAutores();
    };

    fetchRoleAndData();
  }, [router]);

  const cargarAutores = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("autores_mas_frecuentes");

    if (error) {
      toastError("Error al cargar autores frecuentes");
    } else {
      setAutores(data);
    }
    setLoading(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Autores más frecuentes", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [["Nombre del Autor", "Cantidad de Libros"]],
      body: autores.map((a) => [a.nombre_autor, a.cantidad_libros]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("autores_frecuentes.pdf");
    toastSuccess("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Autores Frecuentes");

    sheet.columns = [
      { header: "Nombre del Autor", key: "nombre", width: 40 },
      { header: "Cantidad de Libros", key: "total", width: 20 },
    ];

    autores.forEach((a) => {
      sheet.addRow({ nombre: a.nombre_autor, total: a.cantidad_libros });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "autores_frecuentes.xlsx");
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
          Autores más frecuentes
        </h1>
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
          <p className="text-blue">Cargando autores...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Nombre del Autor</th>
                <th className="px-4 py-3 text-left">Cantidad de Libros</th>
              </tr>
            </thead>
            <tbody>
              {autores.length > 0 ? (
                autores.map((a, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">{a.nombre_autor}</td>
                    <td className="px-4 py-3">{a.cantidad_libros}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-4 py-6 text-center text-blue">
                    No se encontraron autores con libros registrados
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
