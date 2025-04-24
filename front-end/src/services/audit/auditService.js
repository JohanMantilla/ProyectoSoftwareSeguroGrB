import api from "../api";
import { getToken } from "../token/store";


// Obtener todos los registros de auditoría
export const getAllAuditLogs = async () => {
  try {
      const token = getToken("accessToken");

      if (!token) {
          console.error("❌ No hay token disponible.");
          throw new Error("No autorizado: Token no encontrado.");
      }

      console.log("🟢 Enviando solicitud a Audit con token:", token);

      const response = await api.get(`audit/find-all`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Registros de auditoría obtenidos:", response.data);
      return response.data;
  } catch (error) {
      console.error("❌ Error al obtener registros de auditoría:", error);
      throw error;
  }
};

// Obtener un registro de auditoría por ID
export const getAuditLogById = async (id) => {
  try {
    const response = await api.get(`/audit/find-by-id/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo registro de auditoría con ID ${id}`, error);
    throw error;
  }
};

// Obtener registros de auditoría por usuario
export const getAuditLogsByUser = async (usuarioId) => {
  try {
    const response = await api.get(`/audit/find-by-user/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo registros de auditoría del usuario ${usuarioId}`, error);
    throw error;
  }
};

// Crear un nuevo registro de auditoría (para pruebas o logs manuales)
export const createAuditLog = async (auditData) => {
  try {
    const response = await api.post(`/audit/create`, auditData);
    return response.data;
  } catch (error) {
    console.error("Error creando registro de auditoría", error);
    throw error;
  }
};
