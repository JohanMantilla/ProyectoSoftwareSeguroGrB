import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePersonalData } from "../../hooks/usePersonalData";
import Swal from "sweetalert2";

export const Dashboard = () => {
  const { user } = useAuth();
  const { personalData, loading, updateUserPersonalData, deleteUserPersonalData, createUserPersonalData } = usePersonalData(user?.id, user?.rol);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  if (loading) {
    return <p className="text-center mt-10">Cargando datos...</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (personalData && personalData.length > 0) {
      await updateUserPersonalData(personalData[0]?.titularId, personalData[0]?.id, formData);
    } else if (user?.id) {
      await createUserPersonalData({ ...formData, titularId: user.id });
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!personalData || personalData.length === 0) {
      Swal.fire("Error", "No hay datos para eliminar.", "error");
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto eliminará tus datos personales y no se podrá recuperar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteUserPersonalData(personalData[0]?.id);
        Swal.fire("Eliminado", "Tus datos han sido eliminados.", "success");
      }
    });
  };

  return (
    <div className="bg-white rounded-xl flex flex-col shadow h-full p-4">
      <div className="flex justify-between mb-4">
        <h1 className="montserrat-alternates text-azul-marino-500 sm:text-3xl text-2xl font-semibold">
          Inicio
        </h1>
        <div>
          {personalData && personalData.length > 0 && (
            <button className="bg-red-500 text-white px-4 py-2 rounded mr-2" onClick={handleDelete}>
              Eliminar
            </button>
          )}
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setEditing(!editing)}>
            {editing ? "Cancelar" : personalData?.length > 0 ? "Editar" : "Agregar"}
          </button>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Datos Personales</h2>

        {editing ? (
          <div className="space-y-2">
            <label>Nombre:</label>
            <input type="text" name="name" defaultValue={personalData?.[0]?.name || ""} onChange={handleChange} className="border p-2 w-full" />

            <label>Email:</label>
            <input type="email" name="email" defaultValue={personalData?.[0]?.email || ""} onChange={handleChange} className="border p-2 w-full" />

            <label>Documento:</label>
            <input type="text" name="documentNumber" defaultValue={personalData?.[0]?.documentNumber || ""} onChange={handleChange} className="border p-2 w-full" />

            <label>Legal Basis:</label>
            <input type="text" name="legalBasis" defaultValue={personalData?.[0]?.legalBasis || ""} onChange={handleChange} className="border p-2 w-full" />

            <label>Propósito:</label>
            <input type="text" name="purpose" defaultValue={personalData?.[0]?.purpose || ""} onChange={handleChange} className="border p-2 w-full" />

            <label>Retención:</label>
            <input 
              type="date" 
              name="retentionTime" 
              defaultValue={personalData?.[0]?.retentionTime 
                ? new Date(personalData[0]?.retentionTime).toISOString().split("T")[0] 
                : ""} 
              onChange={handleChange} 
              className="border p-2 w-full" 
            />

            <button className="bg-green-500 text-white px-4 py-2 rounded mt-2" onClick={handleSave}>
              Guardar
            </button>
          </div>
        ) : personalData && personalData.length > 0 ? (
          <>
            <p><strong>Nombre:</strong> {personalData[0]?.name || "No disponible"}</p>
            <p><strong>Email:</strong> {personalData[0]?.email || "No disponible"}</p>
            <p><strong>Documento:</strong> {personalData[0]?.documentNumber || "No disponible"}</p>
            <p><strong>Legal Basis:</strong> {personalData[0]?.legalBasis || "No disponible"}</p>
            <p><strong>Propósito:</strong> {personalData[0]?.purpose || "No disponible"}</p>
            <p><strong>Retención:</strong> {personalData[0]?.retentionTime 
              ? new Date(personalData[0]?.retentionTime).toLocaleDateString() 
              : "No disponible"}
            </p>
          </>
        ) : (
          <p className="text-center text-gray-500">No hay datos personales. Agrega tu información.</p>
        )}
      </div>
    </div>
  );
};
