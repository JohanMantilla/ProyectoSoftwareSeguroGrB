import { useAuth } from "../../hooks/useAuth";
import { usePersonalData } from "../../hooks/usePersonalData";
import { useEffect, useState } from "react";
import { FaBell, FaCog, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

const PersonalData = () => {
  const { user } = useAuth();
  const { personalData, arcoRequests, loading, approveOrRejectARCO } = usePersonalData(user?.id, user?.rol);

  if (loading) {
    return <p className="text-center mt-10">Cargando datos...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <FaShieldAlt className="text-blue-600 text-3xl" />
          <h1 className="text-xl font-semibold">Privacy Hub</h1>
        </div>
        <div className="flex gap-3">
          <FaBell className="text-gray-500 text-lg cursor-pointer" />
          <FaCog className="text-gray-500 text-lg cursor-pointer" />
          <FaSignOutAlt className="text-red-500 text-lg cursor-pointer" />
        </div>
      </div>

      {/* Perfil */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-lg">👤</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{user.nombre}</h2>
          <p className="text-gray-500">{user.rol === "ADMIN_ROLE" ? "Administrador" : "Usuario"}</p>
        </div>
      </div>

      {/* Información Personal */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Información Personal</h3>
        <p className="text-gray-600 text-sm mb-2">
          Gestiona tu información personal y preferencias de privacidad.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Email:</strong> {personalData?.email}</p>
          <p><strong>Último Acceso:</strong> {personalData?.ultimoAcceso}</p>
        </div>
      </div>

      {/* Uso de Datos Autorizado */}
      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Uso de Datos Autorizado</h3>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {personalData?.autorizaciones?.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* SOLO PARA ADMINISTRADORES */}
      {user.rol === "ADMIN_ROLE" && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-2">Gestión de Solicitudes ARCO</h3>
          <ul className="text-sm">
            {arcoRequests.length === 0 ? (
              <p>No hay solicitudes pendientes.</p>
            ) : (
              arcoRequests.map((req) => (
                <li key={req.id} className="mb-2 p-2 border rounded-lg flex justify-between items-center">
                  <span><strong>{req.tipo}</strong> - Estado: {req.estado}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveOrRejectARCO(req.id, "COMPLETADO")}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => approveOrRejectARCO(req.id, "RECHAZADO")}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Rechazar
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PersonalData;
