// src/app/informes/libros/page.js
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

export default function InformesLibros() {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    anio: "",
    idioma: "",
    tipoAutoria: "",
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
      await cargarLibros();
    };

    fetchRoleAndData();
  }, [router]);

  const cargarLibros = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("libros")
      .select(
        "id_libro, titulo, anioPublicacion, idioma, tipoAutoria, unidades_academicas(nombre)"
      )
      .order("anioPublicacion", { ascending: false });

    if (error) {
      toast.error("Error al cargar libros");
    } else {
      setLibros(data);
    }
    setLoading(false);
  };

  const filtrarLibros = useMemo(() => {
    return libros.filter((libro) => {
      return (
        (!filtros.anio || libro.anioPublicacion == filtros.anio) &&
        (!filtros.idioma ||
          (libro.idioma &&
            libro.idioma
              .toLowerCase()
              .includes(filtros.idioma.toLowerCase()))) &&
        (!filtros.tipoAutoria ||
          (libro.tipoAutoria &&
            libro.tipoAutoria
              .toLowerCase()
              .includes(filtros.tipoAutoria.toLowerCase())))
      );
    });
  }, [libros, filtros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Libros", 14, 20);
    autoTable(doc, {
      startY: 40,
      head: [
        ["Título", "Año", "Idioma", "Tipo de Autoría", "Unidad Académica"],
      ],
      body: filtrarLibros.map((libro) => [
        libro.titulo || "N/A",
        libro.anioPublicacion || "N/A",
        libro.idioma || "N/A",
        libro.tipoAutoria || "N/A",
        libro.unidades_academicas?.nombre || "N/A",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138] },
    });
    doc.save("informe_libros.pdf");
    toast.success("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Libros");

    sheet.columns = [
      { header: "Título", key: "titulo", width: 30 },
      { header: "Año", key: "anioPublicacion", width: 10 },
      { header: "Idioma", key: "idioma", width: 15 },
      { header: "Tipo de Autoría", key: "tipoAutoria", width: 20 },
      { header: "Unidad Académica", key: "unidad", width: 25 },
    ];

    filtrarLibros.forEach((libro) => {
      sheet.addRow({
        titulo: libro.titulo || "N/A",
        anioPublicacion: libro.anioPublicacion || "N/A",
        idioma: libro.idioma || "N/A",
        tipoAutoria: libro.tipoAutoria || "N/A",
        unidad: libro.unidades_academicas?.nombre || "N/A",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "informe_libros.xlsx");
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
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Informes de Libros
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <FiltroTexto
          value={filtros.anio}
          placeholder="Año (ej: 2023)"
          onChange={(v) => setFiltros({ ...filtros, anio: v })}
          onClear={() => setFiltros({ ...filtros, anio: "" })}
        />
        <FiltroTexto
          value={filtros.idioma}
          placeholder="Idioma (Español, Inglés...)"
          onChange={(v) => setFiltros({ ...filtros, idioma: v })}
          onClear={() => setFiltros({ ...filtros, idioma: "" })}
        />
        <FiltroTexto
          value={filtros.tipoAutoria}
          placeholder="Tipo de autoría (Individual, Colectiva...)"
          onChange={(v) => setFiltros({ ...filtros, tipoAutoria: v })}
          onClear={() => setFiltros({ ...filtros, tipoAutoria: "" })}
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
          <p className="text-blue">Cargando libros...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Año</th>
                <th className="px-4 py-3 text-left">Idioma</th>
                <th className="px-4 py-3 text-left">Tipo de Autoría</th>
                <th className="px-4 py-3 text-left">Unidad Académica</th>
              </tr>
            </thead>
            <tbody>
              {filtrarLibros.length > 0 ? (
                filtrarLibros.map((libro) => (
                  <tr
                    key={libro.id_libro}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {libro.titulo || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {libro.anioPublicacion || "N/A"}
                    </td>
                    <td className="px-4 py-3">{libro.idioma || "N/A"}</td>
                    <td className="px-4 py-3">{libro.tipoAutoria || "N/A"}</td>
                    <td className="px-4 py-3">
                      {libro.unidades_academicas?.nombre || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-blue">
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
