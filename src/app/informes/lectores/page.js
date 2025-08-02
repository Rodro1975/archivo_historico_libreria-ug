"use client";

import { useEffect, useState } from "react";
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

export default function InformeLectores() {
  const router = useRouter();
  const [lectores, setLectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);
  const [busqueda, setBusqueda] = useState("");

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
      await cargarLectores();
    };

    verificarAcceso();
  }, [router]);

  const cargarLectores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lectores")
      .select("*")
      .order("creado_en", { ascending: false });

    if (error) {
      toastError("Error al cargar lectores");
    } else {
      setLectores(data);
    }
    setLoading(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Lectores", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [["Nombre", "Email", "Rol", "Registrado en", "\u00daltimo acceso"]],
      body: lectoresFiltrados.map((l) => [
        l.nombre,
        l.email,
        l.rol || "-",
        new Date(l.creado_en).toLocaleDateString(),
        l.ultimo_acceso
          ? new Date(l.ultimo_acceso).toLocaleDateString()
          : "Sin acceso",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("lectores.pdf");
    toastSuccess("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Lectores");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rol", key: "rol", width: 15 },
      { header: "Registrado en", key: "creado_en", width: 20 },
      { header: "\u00daltimo acceso", key: "ultimo_acceso", width: 20 },
    ];

    lectoresFiltrados.forEach((l) => {
      sheet.addRow({
        nombre: l.nombre,
        email: l.email,
        rol: l.rol || "-",
        creado_en: new Date(l.creado_en).toLocaleDateString(),
        ultimo_acceso: l.ultimo_acceso
          ? new Date(l.ultimo_acceso).toLocaleDateString()
          : "Sin acceso",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "lectores.xlsx");
    toastSuccess("Excel descargado correctamente");
  };

  const lectoresFiltrados = lectores.filter((l) =>
    l.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
          Informe de Lectores Registrados
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FiltroTexto
          value={busqueda}
          placeholder="Buscar por nombre"
          onChange={(v) => setBusqueda(v)}
          onClear={() => setBusqueda("")}
        />
      </div>

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

      {loading ? (
        <p className="text-blue text-center py-6">Cargando lectores...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Registrado</th>
                <th className="px-4 py-3 text-left">\u00daltimo Acceso</th>
              </tr>
            </thead>
            <tbody>
              {lectoresFiltrados.length > 0 ? (
                lectoresFiltrados.map((l, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">{l.nombre}</td>
                    <td className="px-4 py-3">{l.email}</td>
                    <td className="px-4 py-3">{l.rol || "-"}</td>
                    <td className="px-4 py-3">
                      {new Date(l.creado_en).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {l.ultimo_acceso
                        ? new Date(l.ultimo_acceso).toLocaleDateString()
                        : "Sin acceso"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-blue">
                    No hay lectores registrados.
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
