"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { AiFillCamera } from "react-icons/ai";
import { toast } from "react-hot-toast";

const toastStyle = {
  style: {
    background: "#facc15", // amarillo
    color: "#1e3a8a", // azul oscuro
    fontWeight: "bold",
  },
  iconTheme: {
    primary: "#1e3a8a",
    secondary: "#facc15",
  },
};

const UserProfileCard = ({ userData }) => {
  const [fotoUrl, setFotoUrl] = useState(userData.foto);
  const [uploading, setUploading] = useState(false);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userData.id}-${Date.now()}.${fileExt}`;
    const filePath = `fotos_perfil/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      toast.error("Error al subir la foto.", toastStyle);
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("fotos")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ foto: publicUrl.publicUrl })
      .eq("id", userData.id);

    if (updateError) {
      toast.error("Error al guardar la URL de la imagen.", toastStyle);
      console.error(updateError);
      setUploading(false);
      return;
    }

    setFotoUrl(publicUrl.publicUrl);
    toast.success("Foto cambiada correctamente.", toastStyle);
    setTimeout(() => {
      // Recarga para mostrar la nueva foto en todos los componentes
      window.location.reload();
    }, 1200);

    setUploading(false);
  };

  if (!userData) {
    return (
      <p className="text-center mt-4 text-blue">
        Cargando datos del usuario...
      </p>
    );
  }

  const {
    primer_nombre,
    segundo_nombre,
    apellido_paterno,
    apellido_materno,
    email,
    telefono,
    role,
    justificacion,
    fecha_creacion,
    fecha_modificacion,
    foto,
    autor,
  } = userData;

  const nombreCompleto = `${primer_nombre} ${
    segundo_nombre || ""
  } ${apellido_paterno} ${apellido_materno}`.trim();

  return (
    <>
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-3xl mx-auto">
        {foto && (
          <img
            src={foto}
            alt="Foto de perfil"
            className="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-orange"
          />
        )}
        {fotoUrl && (
          <div className="flex justify-center mt-2">
            <label className="relative cursor-pointer">
              <AiFillCamera
                size={30}
                className={`text-blue hover:text-orange transition duration-200 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}
        <h2 className="text-xl text-center text-blue font-bold mb-2">
          {nombreCompleto}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue text-sm">
          <div>
            <strong>Correo electrónico:</strong>
            <p className="text-black">{email}</p>
          </div>
          <div>
            <strong>Teléfono:</strong>
            <p className="text-black">{telefono || "N/A"}</p>
          </div>
          <div>
            <strong>Rol:</strong>
            <p className="text-blue">{role}</p>
          </div>
          <div>
            <strong>¿Es autor?:</strong>
            <p>{autor ? "Sí" : "No"}</p>
          </div>

          {autor && (
            <>
              <div>
                <strong>Dependencia:</strong>
                <p>{autor.dependencias?.nombre || "No asignada"}</p>
              </div>
              <div>
                <strong>Unidad académica:</strong>
                <p>{autor.unidades_academicas?.nombre || "No asignada"}</p>
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <strong>Justificación:</strong>
            <p className="text-black">{justificacion || "Ninguna"}</p>
          </div>

          <div>
            <strong>Fecha de creación:</strong>
            <p>{new Date(fecha_creacion).toLocaleDateString()}</p>
          </div>
          <div>
            <strong>Última modificación:</strong>
            <p>{new Date(fecha_modificacion).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileCard;
