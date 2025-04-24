import React from "react";

import { useState } from "react";
import { useAudit } from "../../hooks/useAudit";
import { useEffect } from "react";



const Audit = () => {
  const [usuarioId, setUsuarioId] = useState("");
  const { auditLogs, loading } = useAudit(usuarioId);



  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-6">
      <h1 className="text-xl font-semibold mb-4">Registros de Auditoría</h1>

      {/* Filtro por Usuario */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por ID de usuario"
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          className="border p-2 w-full rounded-lg"
        />
      </div>

      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <table className="w-full border-collapse border rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Evento</th>
              <th className="border p-2">Entidad Afectada</th>
              <th className="border p-2">Detalles</th>
              <th className="border p-2">Nivel de Riesgo</th>
              <th className="border p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">No hay registros de auditoría.</td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="border p-2">{log.evento}</td>
                  <td className="border p-2">{log.entidadAfectada}</td>
                  <td className="border p-2">{log.detalles}</td>
                  <td className={`border p-2 ${log.nivelRiesgo === "ALTO" ? "text-red-500" : log.nivelRiesgo === "MEDIO" ? "text-orange-500" : "text-green-500"}`}>
                    {log.nivelRiesgo}
                  </td>
                  <td className="border p-2">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Audit;
