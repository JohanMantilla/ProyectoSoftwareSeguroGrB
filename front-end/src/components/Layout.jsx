import { Outlet } from "react-router-dom";
import { RouteSelect } from "./RouteSelect";
import { Profile } from "./Profile";

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Barra de navegación superior */}
      <div className="flex items-center justify-between bg-white shadow-md px-6 py-3">
        <RouteSelect />
        <Profile />
      </div>

      {/* Contenido principal */}
      <div className="flex-grow bg-gray-100 p-6">
        <Outlet />
      </div>
    </div>
  );
};
