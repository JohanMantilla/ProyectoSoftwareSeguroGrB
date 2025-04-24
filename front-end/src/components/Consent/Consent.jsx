import React, { useState } from "react";
import { useConsent } from "../../hooks/useConsent";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom"; // Importa useNavigate para redireccionar

export const Consent = () => {
  const { consents, loading, revokeConsent, approveConsent, rejectConsent, updateRevokeDate } = useConsent();
  const { user, roles } = useAuth();
  const [editingRevokeDate, setEditingRevokeDate] = useState(null);
  const [revokeDate, setRevokeDate] = useState("");
  const [selectedFinalidad, setSelectedFinalidad] = useState("");
  const navigate = useNavigate(); // Hook para redireccionar

  const finalidades = [
    "REGISTRO_AUTENTICACION",
    "PRESTACION_SERVICIO",
    "GESTION_PAGOS",
    "SEGURIDAD_PREVENCION_FRAUDE",
    "PUBLICIDAD_PERSONALIZADA",
    "ANALISIS_MEJORA_SERVICIO",
    "PERSONALIZACION_CONTENIDO",
    "INTEGRACION_TERCEROS",
    "CUMPLIMIENTO_LEGAL",
    "GESTION_DERECHOS_USUARIO",
    "ENVIO_NOTIFICACIONES",
    "GESTION_SOPORTE_TECNICO",
  ];

  const filteredConsents = selectedFinalidad
    ? consents.filter((consent) => consent.finalidades.includes(selectedFinalidad))
    : consents;

  if (loading) {
    return (
      <div className="w-full p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center p-6">
          <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Cargando consentimientos...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      ACTIVO: "bg-green-100 text-green-800",
      REVOCADO: "bg-red-100 text-red-800",
      RECHAZADO: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "No disponible";
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRevokeDateSubmit = async (consentId) => {
    try {
      const consentData = {
        fechaRevocacion: revokeDate
      };
      await updateRevokeDate(consentId, consentData);
      setEditingRevokeDate(null);
      setRevokeDate("");
    } catch (error) {
      console.error("Error al programar la revocación:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {roles.includes("ADMIN_ROLE") ? 'Gestión de Consentimientos (Admin)' : 'Mis Consentimientos'}
        </h2>
        {/* Botón para crear nuevo consentimiento (solo para admin) */}
        {roles.includes("ADMIN_ROLE") && (
          <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => navigate("/consentLogs")}
        >
          Ver Logs
        </button>
        )}
        {roles.includes("ADMIN_ROLE") && (
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate("/create-consent")} // Redirige a la pantalla de creación
          >
            Crear Nuevo Consentimiento
          </button>
        )}
        {/* Selector de filtro para administradores */}
        {roles.includes("ADMIN_ROLE") && (
          <div className="mt-4">
            <label htmlFor="finalidad" className="block text-sm font-medium text-gray-700">
              Filtrar por finalidad
            </label>
            <select
              id="finalidad"
              name="finalidad"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedFinalidad}
              onChange={(e) => setSelectedFinalidad(e.target.value)}
            >
              <option value="">Todas las finalidades</option>
              {finalidades.map((finalidad) => (
                <option key={finalidad} value={finalidad}>
                  {finalidad}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="p-6">
        {filteredConsents.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-2 text-gray-600">No hay consentimientos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredConsents.map((consent) => (
              <div key={consent.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Titular</p>
                      <p className="mt-1">
                        {roles.includes("ADMIN_ROLE")
                          ? `${consent.titularId} (${consent.titularNombre || 'ID'})`
                          : consent.titularId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estado</p>
                      <div className="mt-1">{getStatusBadge(consent.estado)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Base Legal</p>
                      <p className="mt-1">{consent.baseLegal}</p>
                    </div>
                    <div className="lg:col-span-3">
                      <p className="text-sm font-medium text-gray-500">Finalidades</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {consent.finalidades.map((finalidad, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {finalidad}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Otorgamiento</p>
                      <p className="mt-1">{formatDate(consent.fechaOtorgamiento)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Aprobación</p>
                      <p className="mt-1">{formatDate(consent.fechaAprobacion)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Revocación</p>
                      <p className="mt-1">{formatDate(consent.fechaRevocacion)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-end items-center">
                    {consent.estado === "PENDIENTE" && (
                      <>
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={() => approveConsent(consent.id)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          onClick={() => rejectConsent(consent.id)}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {consent.estado === "ACTIVO" && (
                      <>
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => revokeConsent(consent.id)}
                        >
                          Revocar Ahora
                        </button>
                        {editingRevokeDate === consent.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="datetime-local"
                              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              value={revokeDate}
                              onChange={(e) => setRevokeDate(e.target.value)}
                            />
                            <button
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => handleRevokeDateSubmit(consent.id)}
                            >
                              Guardar
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => {
                                setEditingRevokeDate(null);
                                setRevokeDate("");
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setEditingRevokeDate(consent.id)}
                          >
                            Programar Revocación
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consent;