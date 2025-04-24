import React from "react";
import { Navigate } from "react-router-dom";
import { BiLoaderCircle } from "react-icons/bi";
import { useAuth } from "../../hooks/useAuth";

export const AuthGuard = ({ children, allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col open-sans items-center justify-center h-screen">
        <BiLoaderCircle className="animate-spin size-28 text-azul-marino-500" />
        <p>Redirigiendo...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // ✅ Verifica si el usuario tiene acceso a la ruta protegida
  if (allowedRoles && !allowedRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children;
};
