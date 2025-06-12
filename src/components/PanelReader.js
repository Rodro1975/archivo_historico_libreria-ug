"use client";

import React from "react";

const PanelReader = ({ userData }) => {
  return (
    <div className="bg-white shadow p-6 rounded-xl max-w-2xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-blue mb-2">Panel del Lector</h2>
      <p className="text-gray-700 text-lg">
        Bienvenido, <strong>{userData?.primer_nombre}</strong>
      </p>
      {/* Aquí puedes añadir más funcionalidad */}
    </div>
  );
};

export default PanelReader;
