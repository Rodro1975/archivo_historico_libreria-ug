"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function InformeSoporte() {
  const router = useRouter();
  const [soportes, setSoportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);
  const [filtros, setFiltros] = useState({
    asunto: "",
    estado: "",
    prioridad: "",
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
        toast.error("Acceso restringido");
        router.push("/dashboard");
        return;
      }

      setRol("Administrador");
      await cargarSoportes();
    };

    verificarAcceso();
  }, [router]);

  // Carga soportes de usuarios y lectores, y los une
  const cargarSoportes = async () => {
    setLoading(true);

    // Soportes de usuarios
    const { data: soportesUsuarios, error: errorUsuarios } = await supabase
      .from("soporte")
      .select(
        `
        *,
        usuario:usuario_id (
          primer_nombre, segundo_nombre, apellido_paterno, apellido_materno
        ),
        atendido_por:atendida_por (
          primer_nombre, segundo_nombre, apellido_paterno, apellido_materno
        )
      `
      )
      .order("fecha_creacion", { ascending: false });

    // Soportes de lectores
    const { data: soportesLectores, error: errorLectores } = await supabase
      .from("soporte")
      .select(
        `
        *,
        lector:usuario_id (nombre),
        atendido_por:atendida_por (
          primer_nombre, segundo_nombre, apellido_paterno, apellido_materno
        )
      `
      )
      .order("fecha_creacion", { ascending: false });

    // Filtra los que tienen usuario o lector
    const soportesConUsuario = (soportesUsuarios || []).filter(
      (s) => s.usuario
    );
    const soportesConLector = (soportesLectores || []).filter((s) => s.lector);

    // Marca el tipo para renderizado
    const soportesFinal = [
      ...soportesConUsuario.map((s) => ({ ...s, tipo: "usuario" })),
      ...soportesConLector.map((s) => ({ ...s, tipo: "lector" })),
    ].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

    if (errorUsuarios && errorLectores) {
      toast.error("Error al cargar soportes");
      console.error("SUPABASE ERROR:", errorUsuarios, errorLectores);
    } else {
      setSoportes(soportesFinal);
    }
    setLoading(false);
  };

  const soportesFiltrados = useMemo(() => {
    return soportes.filter((s) => {
      const matchAsunto = s.asunto
        ?.toLowerCase()
        .includes(filtros.asunto.toLowerCase());
      const matchEstado = s.estado
        ?.toLowerCase()
        .includes(filtros.estado.toLowerCase());
      const matchPrioridad = s.prioridad
        ?.toLowerCase()
        .includes(filtros.prioridad.toLowerCase());
      return matchAsunto && matchEstado && matchPrioridad;
    });
  }, [soportes, filtros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Informe de Soporte Técnico", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Asunto",
          "Prioridad",
          "Estado",
          "Respondida",
          "Fecha Creación",
          "Fecha Resolución",
          "Usuario/Lector",
          "Atendido Por",
        ],
      ],
      body: soportesFiltrados.map((s) => [
        s.id.substring(0, 8) + "...",
        s.asunto,
        s.prioridad,
        s.estado,
        s.respondida ? "Sí" : "No",
        new Date(s.fecha_creacion).toLocaleDateString(),
        s.fecha_resolucion
          ? new Date(s.fecha_resolucion).toLocaleDateString()
          : "N/A",
        s.tipo === "usuario"
          ? [
              s.usuario?.primer_nombre,
              s.usuario?.segundo_nombre,
              s.usuario?.apellido_paterno,
              s.usuario?.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : s.lector?.nombre || "N/A",
        s.atendido_por
          ? [
              s.atendido_por?.primer_nombre,
              s.atendido_por?.segundo_nombre,
              s.atendido_por?.apellido_paterno,
              s.atendido_por?.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : "N/A",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save("informe_soporte.pdf");
    toast.success("PDF descargado correctamente");
  };

  const exportarExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Soporte Técnico");

    sheet.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "Asunto", key: "asunto", width: 40 },
      { header: "Descripción", key: "descripcion", width: 50 },
      { header: "Prioridad", key: "prioridad", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Respondida", key: "respondida", width: 15 },
      { header: "Fecha Creación", key: "fecha_creacion", width: 20 },
      { header: "Fecha Resolución", key: "fecha_resolucion", width: 20 },
      { header: "Usuario/Lector", key: "usuario", width: 25 },
      { header: "Atendido Por", key: "atendido_por", width: 25 },
    ];

    soportesFiltrados.forEach((s) => {
      sheet.addRow({
        id: s.id,
        asunto: s.asunto,
        descripcion: s.descripcion,
        prioridad: s.prioridad,
        estado: s.estado,
        respondida: s.respondida ? "Sí" : "No",
        fecha_creacion: new Date(s.fecha_creacion).toLocaleString(),
        fecha_resolucion: s.fecha_resolucion
          ? new Date(s.fecha_resolucion).toLocaleString()
          : "N/A",
        usuario:
          s.tipo === "usuario"
            ? [
                s.usuario?.primer_nombre,
                s.usuario?.segundo_nombre,
                s.usuario?.apellido_paterno,
                s.usuario?.apellido_materno,
              ]
                .filter(Boolean)
                .join(" ")
            : s.lector?.nombre || "N/A",
        atendido_por: s.atendido_por
          ? [
              s.atendido_por?.primer_nombre,
              s.atendido_por?.segundo_nombre,
              s.atendido_por?.apellido_paterno,
              s.atendido_por?.apellido_materno,
            ]
              .filter(Boolean)
              .join(" ")
          : "N/A",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "informe_soporte.xlsx");
    toast.success("Excel descargado correctamente");
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
          Informe de Soporte Técnico
        </h1>
      </div>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <FiltroTexto
          value={filtros.asunto}
          placeholder="Buscar por asunto"
          onChange={(v) => setFiltros({ ...filtros, asunto: v })}
          onClear={() => setFiltros({ ...filtros, asunto: "" })}
        />
        <FiltroTexto
          value={filtros.estado}
          placeholder="Buscar por estado"
          onChange={(v) => setFiltros({ ...filtros, estado: v })}
          onClear={() => setFiltros({ ...filtros, estado: "" })}
        />
        <FiltroTexto
          value={filtros.prioridad}
          placeholder="Buscar por prioridad"
          onChange={(v) => setFiltros({ ...filtros, prioridad: v })}
          onClear={() => setFiltros({ ...filtros, prioridad: "" })}
        />
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
          <p className="text-blue">Cargando reportes de soporte...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-yellow">
          <table className="min-w-full bg-white text-blue text-sm">
            <thead className="bg-yellow text-blue uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Asunto</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Respondida</th>
                <th className="px-4 py-3 text-left">Fecha Creación</th>
                <th className="px-4 py-3 text-left">Fecha Resolución</th>
                <th className="px-4 py-3 text-left">Usuario/Lector</th>
                <th className="px-4 py-3 text-left">Atendido Por</th>
              </tr>
            </thead>
            <tbody>
              {soportesFiltrados.length > 0 ? (
                soportesFiltrados.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue/5 border-t border-yellow/20"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-medium">{s.asunto}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          s.prioridad === "Alta"
                            ? "bg-red-500 text-white"
                            : s.prioridad === "Media"
                            ? "bg-yellow-500 text-blue"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {s.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3">{s.estado}</td>
                    <td className="px-4 py-3">
                      {s.respondida ? (
                        <span className="text-green-600 font-bold">Sí</span>
                      ) : (
                        <span className="text-red-600 font-bold">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(s.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {s.fecha_resolucion
                        ? new Date(s.fecha_resolucion).toLocaleDateString()
                        : "Pendiente"}
                    </td>
                    <td className="px-4 py-3">
                      {s.tipo === "usuario"
                        ? [
                            s.usuario?.primer_nombre,
                            s.usuario?.segundo_nombre,
                            s.usuario?.apellido_paterno,
                            s.usuario?.apellido_materno,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : s.lector?.nombre || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {s.atendido_por
                        ? [
                            s.atendido_por?.primer_nombre,
                            s.atendido_por?.segundo_nombre,
                            s.atendido_por?.apellido_paterno,
                            s.atendido_por?.apellido_materno,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-6 text-center text-blue">
                    No se encontraron reportes de soporte
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
