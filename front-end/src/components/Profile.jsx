import React, { useState, useEffect } from "react";
import { TbLogout, TbUserCircle } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { logout, getUserInfo } from "../services/auth/auth";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../services/token/store";

export const Profile = () => {
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = getToken("accessToken");
        if (token) {
          const decodedToken = jwtDecode(token);
          const user = await getUserInfo(decodedToken.id, token);
          setUserInfo(user);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <TbUserCircle className="h-6 w-6 text-gray-600" />
        <span className="text-gray-700 text-sm font-semibold">{userInfo.name || "Usuario"}</span>
      </div>
      <button
        className="text-red-500 hover:bg-red-100 px-3 py-1 rounded-md"
        onClick={handleLogout}>
        <TbLogout className="h-5 w-5" />
      </button>
    </div>
  );
};
