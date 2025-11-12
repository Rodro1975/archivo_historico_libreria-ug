"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import supabase from "@/lib/supabase";
import html2canvas from "html2canvas";
import WorkBar from "@/components/WorkBar";
import Image from "next/image";

export default function SoporteAtendidasPage() {
  const [data, setData] = useState([]);
  // FObtener datos al cargar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("soporte")
      .select(
        "id, atendida_por, fecha_creacion, fecha_resolucion, usuarios:atendida_por(primer_nombre, apellido_paterno)"
      );

    if (error) {
      toastError("Error al cargar datos");
      return;
    }

    const agrupado = {};
    // Procesar datos para agrupar por atendida_por
    data.forEach((item) => {
      const nombre = item.usuarios
        ? `${item.usuarios.primer_nombre} ${item.usuarios.apellido_paterno}`
        : "Sin asignar";

      const tiempoRespuesta =
        item.fecha_creacion && item.fecha_resolucion
          ? Math.round(
              (new Date(item.fecha_resolucion) -
                new Date(item.fecha_creacion)) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

      if (!agrupado[nombre]) {
        agrupado[nombre] = { cantidad: 0, totalDias: 0 };
      }

      agrupado[nombre].cantidad++;
      agrupado[nombre].totalDias += tiempoRespuesta;
    });

    const resultado = Object.entries(agrupado).map(([nombre, val]) => ({
      nombre,
      Atendidas: val.cantidad,
      "Promedio de días":
        val.cantidad > 0 ? +(val.totalDias / val.cantidad).toFixed(1) : 0,
    }));

    setData(resultado);
  };

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-soporte-atendidas");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "soporte-atendidas.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <WorkBar />

      <div className="flex flex-col items-center justify-center mb-6">
        <Image
          src="/images/editorial-ug.png"
          alt="Editorial UG"
          width={140}
          height={140}
          className="mb-2"
        />
        <h1 className="text-4xl text-yellow text-center font-bold mt-24 mb-8">
          Solicitudes Atendidas y Tiempo de Respuesta
        </h1>
      </div>
      {data.length > 0 ? (
        <div id="grafica-soporte-atendidas">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#facc15" />
              <XAxis
                dataKey="nombre"
                tick={{ fill: "#facc15" }}
                angle={-20}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis tick={{ fill: "#facc15" }} />
              <Tooltip />
              <Bar dataKey="Atendidas" fill="#3b82f6" />
              <Bar dataKey="Promedio de días" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-white text-center">Cargando gráfica...</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={exportarImagen}
          className="bg-orange text-gold font-bold px-6 py-2 rounded-lg hover:scale-105 transition-all border border-yellow"
        >
          📷 Exportar como imagen
        </button>
      </div>
    </div>
  );
}
