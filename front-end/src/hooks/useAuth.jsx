import { useState, useEffect } from 'react';
import { getToken } from '../services/token/store';
import { verifyToken, getUserInfo } from '../services/auth/auth';

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);  

    useEffect(() => {
        const verifyAuthentication = async () => {
            setLoading(true);
            const token = getToken('accessToken');

            // 🔹 Si no hay token, simplemente salimos sin mostrar advertencia
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setRoles([]);
                setLoading(false);
                return;
            }

            try {
                console.log("🔍 Verificando token...");
                const userData = await verifyToken(token);

                if (!userData || !userData.id) {
                    throw new Error("El usuario autenticado no tiene un ID válido.");
                }

                // Obtener datos completos del usuario
                const fullUserData = await getUserInfo(userData.id, token);
                console.log("✅ Usuario autenticado:", fullUserData);

                setUser(fullUserData);
                setRoles(fullUserData.roles || []);  
                setIsAuthenticated(true);
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
                setIsAuthenticated(false);
                setUser(null);
                setRoles([]);
            }

            setLoading(false);
        };

        // Ejecutar la verificación **solo después de un pequeño retraso**
        setTimeout(verifyAuthentication, 500);
    }, []);

    return { loading, isAuthenticated, user, roles };
};
