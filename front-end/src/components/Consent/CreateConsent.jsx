import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { consentService } from "../../services/consent/consentService"; // Importar el servicio

export const CreateConsent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titularId: "",
    finalidades: [],
    baseLegal: "CONSENTIMIENTO",
    datosTratados: [],
    version: "1.0",
  });
  const [error, setError] = useState(null); // Estado para manejar errores
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para manejar el envío

  const finalidadesOptions = [
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

  const baseLegalOptions = [
    "CONSENTIMIENTO",
    "CONTRATO",
    "OBLIGACION_LEGAL",
    "INTERES_VITAL",
    "INTERES_PUBLICO",
    "INTERES_LEGITIMO",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        finalidades: checked
          ? [...prev.finalidades, value]
          : prev.finalidades.filter((item) => item !== value),
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDatosTratadosChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      datosTratados: value.split(",").map((item) => item.trim()),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    setIsSubmitting(true); // Indicar que se está enviando el formulario

    try {
      // Llamar a la API para crear el consentimiento
      await consentService.createConsent(formData);
      // Redirigir a la lista de consentimientos después de crear
      navigate("/consent");
    } catch (error) {
      console.error("Error al crear el consentimiento:", error);
      setError("Error al crear el consentimiento. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false); // Finalizar el estado de envío
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Consentimiento</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo: titularId */}
        <div>
          <label htmlFor="titularId" className="block text-sm font-medium text-gray-700">
            ID del Titular
          </label>
          <input
            type="text"
            id="titularId"
            name="titularId"
            value={formData.titularId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Campo: finalidades (múltiples selecciones) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Finalidades</label>
          <div className="mt-2 space-y-2">
            {finalidadesOptions.map((finalidad) => (
              <div key={finalidad} className="flex items-center">
                <input
                  type="checkbox"
                  id={finalidad}
                  name="finalidades"
                  value={finalidad}
                  checked={formData.finalidades.includes(finalidad)}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={finalidad} className="ml-2 text-sm text-gray-700">
                  {finalidad}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Campo: baseLegal (selección única) */}
        <div>
          <label htmlFor="baseLegal" className="block text-sm font-medium text-gray-700">
            Base Legal
          </label>
          <select
            id="baseLegal"
            name="baseLegal"
            value={formData.baseLegal}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            {baseLegalOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Campo: datosTratados (lista separada por comas) */}
        <div>
          <label htmlFor="datosTratados" className="block text-sm font-medium text-gray-700">
            Datos Tratados (separados por comas)
          </label>
          <input
            type="text"
            id="datosTratados"
            name="datosTratados"
            value={formData.datosTratados.join(", ")}
            onChange={handleDatosTratadosChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Campo: version */}
        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-700">
            Versión
          </label>
          <input
            type="text"
            id="version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/consent")}
            className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting} // Deshabilitar el botón mientras se envía
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateConsent;