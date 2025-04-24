import Cookies from 'js-cookie';
import { verifyToken } from '../auth/auth';

export const getToken = (key) => {
    try {
        return Cookies.get(key);
    } catch (error) {
        Cookies.remove(key);
        return null;
    }
};

export const saveToken = (key, value) => {
    try {
        Cookies.set(key, value, { secure: true, sameSite: 'Strict' });
    } catch (err) {
        return;
    }
};

export const isTokenValid = async (key) => {
    try {
        const token = getToken(key);
        if (!token) {
            return false;
        }else{
            const response = await verifyToken(token);
            return response.status === 200;
        }
    } catch (error) {
        return false; // Cualquier error implica token inválido
    }
};

export const deleteToken = (key) => {
    try {
        Cookies.remove(key);
    } catch (err) {
        return;
    }
};
