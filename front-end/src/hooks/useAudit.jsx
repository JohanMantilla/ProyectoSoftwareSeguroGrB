import { useState, useEffect } from "react";
import { getAllAuditLogs, getAuditLogsByUser } from "../services/audit/auditService";

export const useAudit = (usuarioId = null) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, [usuarioId]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = usuarioId ? await getAuditLogsByUser(usuarioId) : await getAllAuditLogs();
      setAuditLogs(data);
    } catch (error) {
      console.error("Error obteniendo registros de auditoría", error);
    } finally {
      setLoading(false);
    }
  };

  return { auditLogs, loading };
};
