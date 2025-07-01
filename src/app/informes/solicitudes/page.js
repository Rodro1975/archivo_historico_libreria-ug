"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import WorkBar from "@/components/WorkBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";

const toastStyle = {
  style: {
    background: "#facc15",
    color: "#1e3a8a",
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

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

export default function InformeSolicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);
  const [filtros, setFiltros] = useState({ nombre: "", estado: "" });

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
        toast.error("Acceso restringido");
        router.push("/dashboard");
        return;
      }

      setRol("Administrador");
      await cargarSolicitudes();
    };

    verificarAcceso();
  }, [router]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*, lectores(nombre)")
      .order("creado_en", { ascending: false });

    if (error) {
      toast.error("Error al cargar solicitudes");
    } else {
      setSolicitudes(data);
    }
    setLoading(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Solicitudes", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [["Nombre", "Tipo", "Estado", "Detalle", "Fecha"]],
      body: solicitudesFiltradas.map((s) => [
        s.lectores?.nombre || "-",
        s.tipo,
        s.estado,
        s.detalle,
        new Date(s.creado_en).toLocaleDateString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("solicitudes.pdf");
    toast.success("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Solicitudes");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Tipo", key: "tipo", width: 20 },
      { header: "Estado", key: "estado", width: 20 },
      { header: "Detalle", key: "detalle", width: 40 },
      { header: "Fecha", key: "creado_en", width: 20 },
    ];

    solicitudesFiltradas.forEach((s) => {
      sheet.addRow({
        nombre: s.lectores?.nombre || "-",
        tipo: s.tipo,
        estado: s.estado,
        detalle: s.detalle,
        creado_en: new Date(s.creado_en).toLocaleDateString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "solicitudes.xlsx");
    toast.success("Excel descargado correctamente");
  };

  const solicitudesFiltradas = solicitudes.filter(
    (s) =>
      s.lectores?.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
      s.estado.toLowerCase().includes(filtros.estado.toLowerCase())
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
      <Toaster position="top-right" toastOptions={toastStyle} />
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
          Informe de Solicitudes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <FiltroTexto
          value={filtros.nombre}
          placeholder="Buscar por nombre"
          onChange={(v) => setFiltros({ ...filtros, nombre: v })}
          onClear={() => setFiltros({ ...filtros, nombre: "" })}
        />
        <FiltroTexto
          value={filtros.estado}
          placeholder="Buscar por estado (Pendiente, Aprobado...)"
          onChange={(v) => setFiltros({ ...filtros, estado: v })}
          onClear={() => setFiltros({ ...filtros, estado: "" })}
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
        <p className="text-blue text-center py-6">Cargando solicitudes...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Detalle</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.length > 0 ? (
                solicitudesFiltradas.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {s.lectores?.nombre || "-"}
                    </td>
                    <td className="px-4 py-3">{s.tipo}</td>
                    <td className="px-4 py-3">{s.estado}</td>
                    <td className="px-4 py-3">{s.detalle}</td>
                    <td className="px-4 py-3">
                      {new Date(s.creado_en).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-blue">
                    No hay solicitudes registradas.
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
