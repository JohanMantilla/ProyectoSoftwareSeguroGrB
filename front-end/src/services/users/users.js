import axios from "axios";
import { getToken, isTokenValid } from "../token/store";

export const findAllUsers = async () => {
  try {
    await isTokenValid("accessToken");
    const accessToken = getToken("accessToken");

    const initialResponse = await axios.get("api/user/find-all-users", {
      params: { limit: 1 },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const total = initialResponse.data.meta.totalUsers;

    if (!total || total === 0) {
      return [];
    }
    const response = await axios.get("api/user/find-all-users", {
      params: { limit: total },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener los usuarios");
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    await isTokenValid("accessToken");
    const accessToken = getToken("accessToken");

    await axios.delete(`api/user/delete-user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    console.error("Error al eliminar el usuario");
    throw error;
  }
};

export const findUserById = async (userId) => {
  try {
    await isTokenValid("accessToken");
    const accessToken = getToken("accessToken");

    const response = await axios.get(`api/user/find-by-id/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el usuario");
    throw error;
  }
};
