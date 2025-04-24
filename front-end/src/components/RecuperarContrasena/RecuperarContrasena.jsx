import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BiLoaderCircle } from "react-icons/bi";
import { SendEmail } from './SendEmail';
import { ResetPasswordForm } from './ResetPasswordForm';

export const RecuperarContrasena = () => {
    const { loading, isAuthenticated } = useAuth(); // Usa el hook personalizado
    const [showResetForm, setShowResetForm] = useState(false); // Controla el flujo de los pasos
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleEmailSent = () => {
        setShowResetForm(true); // Cambia al formulario de reseteo de contraseña
    };

    if (loading) {
        // Mostrar un loader mientras se verifica
        return (
            <div className="flex flex-col open-sans items-center justify-center h-screen">
                <BiLoaderCircle className="animate-spin size-28 text-azul-marino-500" />
                <p>Redirigiendo...</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex">
            {/* Imagen de fondo */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('./Background.jpg')` }}
            />

            {/* Contenedor para los formularios */}
            <div className="w-full ml-auto h-full flex items-center justify-center backdrop-blur-sm bg-white/20">
                {showResetForm ? (
                    <ResetPasswordForm />
                ) : (
                    <SendEmail onEmailSent={handleEmailSent} />
                )}
            </div>
        </div>
    );
};

