"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { AiFillCamera } from "react-icons/ai";
import { toastSuccess, toastError } from "@/lib/toastUtils";

const UserProfileCard = ({ userData }) => {
  const [fotoUrl, setFotoUrl] = useState(userData.foto);
  const [uploading, setUploading] = useState(false);
  // Manejar el cambio de foto de perfil
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
      toastError("Error al subir la foto.");
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
      toastError("Error al guardar la URL de la imagen.");
      console.error(updateError);
      setUploading(false);
      return;
    }
    // Actualizar la foto en el estado local
    setFotoUrl(publicUrl.publicUrl);
    toastSuccess("Foto cambiada correctamente.");
    setTimeout(() => {
      window.location.reload(); // Recarga para actualizar todos los componentes
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
  // Desestructurar los datos del usuario
  const {
    primer_nombre,
    segundo_nombre,
    apellido_paterno,
    apellido_materno,
    email,
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

        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 md:auto-rows-fr items-stretch gap-3 md:gap-4 text-blue text-sm">
          {/* Fila 1 */}
          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">Correo electrónico:</dt>
            <dd className="text-black break-words">{email}</dd>
          </dl>

          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">Rol:</dt>
            <dd className="text-blue">{role}</dd>
          </dl>

          {/* Fila 2 */}
          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">¿Es autor?:</dt>
            <dd>{autor ? "Sí" : "No"}</dd>
          </dl>

          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">Dependencia:</dt>
            <dd>{autor?.dependencias?.nombre || "No asignada"}</dd>
            <dt className="font-semibold">Unidad académica:</dt>
            <dd>{autor?.unidades_academicas?.nombre || "No asignada"}</dd>
          </dl>

          {/* Fila 3 */}
          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">Justificación:</dt>
            <dd className="text-black break-words">
              {justificacion || "Ninguna"}
            </dd>
          </dl>

          <dl className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-0.5 leading-tight">
            <dt className="font-semibold">Fecha de creación:</dt>
            <dd>{new Date(fecha_creacion).toLocaleDateString()}</dd>
            <dt className="font-semibold">Última modificación:</dt>
            <dd>{new Date(fecha_modificacion).toLocaleDateString()}</dd>
          </dl>
        </div>
      </div>
    </>
  );
};

export default UserProfileCard;
