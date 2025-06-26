// src/app/informes/autores/page.js
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import { FaSearch, FaFilePdf, FaFileExcel } from "react-icons/fa";
import WorkBar from "@/components/WorkBar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

export default function InformesAutores() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nombre: "",
    cargo: "",
    vigente: "",
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
        toast.error("Acceso restringido");
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
    const { data, error } = await supabase
      .from("autores")
      .select(
        `id, nombre_completo, cargo, correo_institucional, vigencia, 
        dependencias(nombre), unidades_academicas(nombre)`
      )
      .order("nombre_completo", { ascending: true });

    if (error) {
      toast.error("Error al cargar autores");
    } else {
      setAutores(data);
    }
    setLoading(false);
  };

  const autoresFiltrados = useMemo(() => {
    return autores.filter((a) => {
      const matchNombre = a.nombre_completo
        .toLowerCase()
        .includes(filtros.nombre.toLowerCase());
      const matchCargo = a.cargo
        ?.toLowerCase()
        .includes(filtros.cargo.toLowerCase());
      const matchVigente =
        filtros.vigente === ""
          ? true
          : filtros.vigente === "true"
          ? a.vigencia
          : !a.vigencia;
      return matchNombre && matchCargo && matchVigente;
    });
  }, [autores, filtros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Autores", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [
        [
          "Nombre",
          "Cargo",
          "Correo",
          "Unidad Académica",
          "Dependencia",
          "Vigente",
        ],
      ],
      body: autoresFiltrados.map((a) => [
        a.nombre_completo || "N/A",
        a.cargo || "N/A",
        a.correo_institucional || "N/A",
        a.unidades_academicas?.nombre || "N/A",
        a.dependencias?.nombre || "N/A",
        a.vigencia ? "Sí" : "No",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("informe_autores.pdf");
    toast.success("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Autores");

    sheet.columns = [
      { header: "Nombre", key: "nombre", width: 30 },
      { header: "Cargo", key: "cargo", width: 20 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Unidad Académica", key: "unidad", width: 25 },
      { header: "Dependencia", key: "dependencia", width: 25 },
      { header: "Vigente", key: "vigente", width: 10 },
    ];

    autoresFiltrados.forEach((a) => {
      sheet.addRow({
        nombre: a.nombre_completo || "N/A",
        cargo: a.cargo || "N/A",
        correo: a.correo_institucional || "N/A",
        unidad: a.unidades_academicas?.nombre || "N/A",
        dependencia: a.dependencias?.nombre || "N/A",
        vigente: a.vigencia ? "Sí" : "No",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "informe_autores.xlsx");
    toast.success("Excel descargado correctamente");
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
        <h1 className="text-3xl font-bold text-white text-center">
          Informe de Autores
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <FiltroTexto
          value={filtros.nombre}
          placeholder="Buscar por nombre"
          onChange={(v) => setFiltros({ ...filtros, nombre: v })}
          onClear={() => setFiltros({ ...filtros, nombre: "" })}
        />
        <FiltroTexto
          value={filtros.cargo}
          placeholder="Buscar por cargo"
          onChange={(v) => setFiltros({ ...filtros, cargo: v })}
          onClear={() => setFiltros({ ...filtros, cargo: "" })}
        />
        <FiltroSelect
          value={filtros.vigente}
          onChange={(v) => setFiltros({ ...filtros, vigente: v })}
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
        <div className="text-center py-8">
          <p className="text-blue">Cargando autores...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Correo</th>
                <th className="px-4 py-3 text-left">Unidad Académica</th>
                <th className="px-4 py-3 text-left">Dependencia</th>
                <th className="px-4 py-3 text-left">Vigente</th>
              </tr>
            </thead>
            <tbody>
              {autoresFiltrados.length > 0 ? (
                autoresFiltrados.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {a.nombre_completo}
                    </td>
                    <td className="px-4 py-3">{a.cargo}</td>
                    <td className="px-4 py-3">{a.correo_institucional}</td>
                    <td className="px-4 py-3">
                      {a.unidades_academicas?.nombre}
                    </td>
                    <td className="px-4 py-3">{a.dependencias?.nombre}</td>
                    <td className="px-4 py-3">{a.vigencia ? "Sí" : "No"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-blue">
                    No se encontraron autores
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

function FiltroSelect({ value, onChange }) {
  return (
    <div className="flex items-center w-full max-w-md mx-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded p-2 flex-grow bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] text-blue font-semibold"
      >
        <option value="">Todos</option>
        <option value="true">Sí</option>
        <option value="false">No</option>
      </select>
    </div>
  );
}
