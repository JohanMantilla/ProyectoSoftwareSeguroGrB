import React, { useEffect, useState } from "react";
import { getARCORequests } from "../../services/personal-data/personalDataService";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export const SolicitudesArco = () => {
  const [arcoRequests, setArcoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getARCORequests();
        setArcoRequests(response.data); // Extraemos solo la data
      } catch (error) {
        console.error("❌ Error obteniendo solicitudes ARCO:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Cargando solicitudes...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-semibold text-azul-marino-500 mb-4">Solicitudes ARCO</h2>

      {arcoRequests.length === 0 ? (
        <p className="text-center text-gray-500">No hay solicitudes pendientes.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Fecha Solicitud</th>
              <th className="border p-2">Fecha Respuesta</th>
              <th className="border p-2">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {arcoRequests.map((request) => (
              <tr key={request.id} className="border-b">
                <td className="border p-2">{request.tipo}</td>
                <td className="border p-2 flex items-center">
                  {request.status === "COMPLETED" ? (
                    <FaCheckCircle className="text-green-500 mr-2" />
                  ) : (
                    <FaTimesCircle className="text-red-500 mr-2" />
                  )}
                  {request.status}
                </td>
                <td className="border p-2">
                  {new Date(request.requestDate).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  {request.replyDate ? new Date(request.replyDate).toLocaleDateString() : "Pendiente"}
                </td>
                <td className="border p-2">{request.rejectReason || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
