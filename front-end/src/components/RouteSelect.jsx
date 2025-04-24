import React from "react";
import { Link, useLocation } from "react-router-dom";
import { TbHome, TbWeight, TbUsers, TbShieldCheck } from "react-icons/tb";
import { useAuth } from "../hooks/useAuth";


const NavItem = ({ Icon, title, to }) => {
  const location = useLocation();
  const isSelected = location.pathname === to;

  return (
    <Link to={to}>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all 
                ${
                  isSelected
                    ? "text-white bg-azul-marino-500 shadow"
                    : "hover:bg-gray-200 text-gray-600"
                }`}>
        <Icon className="h-5 w-5" />
        <span>{title}</span>
      </button>
    </Link>
  );
};

export const RouteSelect = () => {
  const { user } = useAuth(); // Obtener usuario y roles

  if (!user) return null; // ⚠️ Evita mostrar opciones antes de obtener datos

  return (
    <nav className="w-full flex justify-between bg-white shadow-md px-6 py-3">
      <div className="flex gap-4">
        <NavItem Icon={TbHome} title="Inicio" to="/" />

        {user.roles.includes("ADMIN_ROLE") && (
          <NavItem Icon={TbShieldCheck} title="Solicitudes ARCO" to="/solicitudes_arco" />
        )}
        <NavItem Icon={TbWeight} title="Consentimiento" to="/consent" />

        {/* ✅ Solo ADMIN_ROLE puede ver "Auditorías" */}
        {user.roles.includes("ADMIN_ROLE") && (
          <NavItem Icon={TbShieldCheck} title="Auditorías" to="/audit" />
        )}
      </div>
    </nav>
  );
};


