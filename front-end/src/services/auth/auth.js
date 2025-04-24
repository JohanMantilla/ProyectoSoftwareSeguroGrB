import axios from "axios";
import { getToken, saveToken, deleteToken } from "../token/store";

export const signIn = async (email, password) => {
    try {
        const body = { email, password };
        const response = await axios.post('api/auth/login', body, {
            headers: {
                Authorization: 'none',
                'Content-Type': 'application/json',
            },
        });
        const { accessToken } = response.data;
        return { accessToken };
    } catch (error) {
        console.error('Login error:', error);

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    throw new Error('Credenciales inválidas');
                case 401:
                    throw new Error('Verifique sus credenciales');
                case 404:
                    throw new Error('Usuario no encontrado');
                case 500:
                    throw new Error(`Error al ingresar a la plataforma: ${error.response.data.message || 'No se proporcionaron detalles adicionales'}`);
            }
        } else if (error.request) {
            throw new Error('No se recibió respuesta del servidor. Por favor, verifique su conexión a internet.');
        } else {
            throw new Error(`Error al realizar la solicitud: ${error.message}`);
        }
    }
};

export const logout = async () => {
    try {
        const accessToken = getToken('accessToken');
        await axios.post('api/auth/logout', {}, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        deleteToken('accessToken');
        deleteToken('refreshToken');
    } catch (error) {
        console.error('Error al cerrar sesión');
        throw error;
    }
};


export const verifyToken = async (token) => {
    try {
        const response = await axios.get('api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Respuesta de verifyToken:", response.data); // Asegura que el user está presente

        return response.data.user;  // ✅ Retornamos solo el objeto user
    } catch (error) {
        if (error.response && error.response.status === 401) {
            try {
                await refreshAccessToken();
                console.log('Token refrescado');
            } catch (refreshError) {
                console.error('Error al refrescar el token:', refreshError);
            }
        }
        console.error('Error al verificar el token:', error);
        throw error;
    }
};


export const refreshAccessToken = async () => {
    try {
        const response = await axios.post('api/auth/refresh', {}, {
            withCredentials: true, // Asegúrate de que la cookie sea enviada con la solicitud
        });

        const { accessToken } = response.data;

        // Guardamos el nuevo access token en cookies o almacenamiento local
        saveToken('accessToken', accessToken);


        return accessToken;
    } catch (error) {
        console.error('Error al refrescar el access token', error);
        throw new Error('Error al refrescar el token de acceso');
    }
};


export const getUserInfo = async (id, token) => {
    try {
        const response = await axios.get(`api/user/find-by-id/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el usuario');
        throw error;
    }
};

export const updatePassword = async (userId, currentPassword, newPassword, confirmPassword, token) => {
    try {
        const body = { userId, currentPassword, newPassword, confirmNewPassword: confirmPassword };
        const response = await axios.patch(`api/auth/change-password`, body, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la contraseña');
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`api/auth/forgot-password`, { email }, {
            headers: { 'Authorization': 'none' }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 502:
                    throw new Error('El servidor no está disponible en este momento. Por favor, inténtelo más tarde.');
                case 404:
                    throw new Error('El correo electrónico no está registrado.');
                case 400:
                    throw new Error(error.response.data.message || 'Datos inválidos.');
                default:
                    throw new Error(`Error al enviar el correo: ${error.response.data.message || 'Error del servidor'}`);
            }
        } else if (error.request) {
            throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
        } else {
            throw new Error(`Error en la solicitud: ${error.message}`);
        }
    }
};

export const resetPassword = async (code, newPassword) => {
    try {
        const body = { token: code, password: newPassword };
        const response = await axios.post(`api/auth/reset-password`, body);
        return response.data;
    } catch (error) {
        console.error('Error al restablecer la contraseña');
        throw error;
    }
};

export const registerUser = async (name, email, password) => {
    try {
        const body = { name, email, password };
        const response = await axios.post('api/auth/register', body, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data; // Retorna los datos del usuario registrado
    } catch (error) {
        console.error('Error al registrar usuario:', error);

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    throw new Error('Datos inválidos');
                case 409:
                    throw new Error('El correo electrónico ya está en uso');
                case 500:
                    throw new Error('Error en el servidor al registrar usuario');
                default:
                    throw new Error(error.response.data.message || 'Error desconocido');
            }
        } else {
            throw new Error('No se pudo conectar con el servidor.');
        }
    }
};
