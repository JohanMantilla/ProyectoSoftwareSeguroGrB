import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth/auth";
import Swal from "sweetalert2";

export const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(form);
      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        text: "Ahora puedes iniciar sesión.",
        confirmButtonColor: "#16243e",
      });
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrarse",
        text: error.message,
        confirmButtonColor: "#16243e",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Registro de Usuario</h2>

        <input type="text" name="name" placeholder="Nombre" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};
