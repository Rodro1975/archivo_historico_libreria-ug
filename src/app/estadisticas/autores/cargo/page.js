"use client";

import { useEffect, useState } from "react";
import WorkBar from "@/components/WorkBar";
import { toastSuccess, toastError } from "@/lib/toastUtils";
import Image from "next/image";
import html2canvas from "html2canvas";
import supabase from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export default function AutoresPorCargoPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("autores")
        .select("cargo")
        .neq("cargo", null);

      if (error) {
        toastError("Error al cargar datos de cargos");
        return;
      }

      const conteo = data.reduce((acc, autor) => {
        acc[autor.cargo] = (acc[autor.cargo] || 0) + 1;
        return acc;
      }, {});

      const resultados = Object.entries(conteo).map(([cargo, cantidad]) => ({
        cargo,
        cantidad,
      }));

      setData(resultados);
    }

    fetchData();
  }, []);

  const exportarImagen = async () => {
    const chart = document.querySelector("#grafica-cargo");
    if (!chart) return;

    const canvas = await html2canvas(chart);
    const link = document.createElement("a");
    link.download = "autores_por_cargo.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto bg-blue">
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
          Autores por Cargo
        </h1>

        <p className="text-white text-center max-w-2xl mt-2">
          Número de autores agrupados por su cargo institucional.
        </p>
      </div>

      {data ? (
        <div id="grafica-cargo" className="w-full">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
              <XAxis type="number" stroke="#facc15" />
              <YAxis
                dataKey="cargo"
                type="category"
                stroke="#facc15"
                width={200}
              />
              <Tooltip
                formatter={(value) => `${value} autores`}
                contentStyle={{ backgroundColor: "#1e3a8a", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="cantidad" fill="#facc15">
                <LabelList
                  dataKey="cantidad"
                  position="right"
                  stroke="#1e3a8a"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-white text-center">Cargando gráfico...</p>
      )}

      <div className="flex justify-center mt-8">
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
