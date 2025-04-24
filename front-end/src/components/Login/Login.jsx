import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../../services/token/store";
import { signIn } from "../../services/auth/auth";
import { useAuth } from "../../hooks/useAuth";
import { validateSignIn } from "../../services/auth/validateAuthForm";
import { BiLoaderCircle } from "react-icons/bi";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 🕒 Recuperar el bloqueo desde localStorage (si el usuario refresca la página)
  useEffect(() => {
    const storedBlockTime = localStorage.getItem("blockTime");
    if (storedBlockTime) {
      const remainingTime = Math.ceil((parseInt(storedBlockTime) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setBlocked(true);
        setTimer(remainingTime);
      } else {
        localStorage.removeItem("blockTime");
      }
    }
  }, []);

  // ⏳ Manejar la cuenta regresiva
  useEffect(() => {
    if (blocked && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setBlocked(false);
            localStorage.removeItem("blockTime");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [blocked, timer]);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (blocked) {
      Swal.fire({
        icon: "warning",
        title: "Demasiados intentos",
        text: `Intenta nuevamente en ${timer} segundos.`,
        confirmButtonColor: "#16243e",
      });
      return;
    }

    setErrors(validateSignIn(email, password));
    if (errors.length > 0) {
      Swal.fire({
        title: "Formato incorrecto",
        text: errors[0],
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#16243e",
      });
      return;
    }

    setErrors([]);
    setLoadingLogin(true);

    try {
      const response = await signIn(email, password);
      if (!response || !response.accessToken) {
        // 🚫 Bloquear login por 2 minutos
        setBlocked(true);
        setTimer(120);
        localStorage.setItem("blockTime", Date.now() + 120000);

        Swal.fire({
          icon: "warning",
          title: "Demasiados intentos",
          text: "Has realizado demasiados intentos. Intenta nuevamente en 2 minutos.",
          confirmButtonColor: "#16243e",
        });
        throw new Error("Respuesta inválida del servidor.");
      }

      const { accessToken } = response;
      const decodedToken = jwtDecode(accessToken);
      saveToken("accessToken", accessToken);
      console.log("✅ Usuario autenticado:", decodedToken);

      window.location.href = "/";
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);

      if (error.response && error.response.status === 429) {
        // 🚫 Bloquear login por 2 minutos
        setBlocked(true);
        setTimer(120);
        localStorage.setItem("blockTime", Date.now() + 120000);

        Swal.fire({
          icon: "warning",
          title: "Demasiados intentos",
          text: "Has realizado demasiados intentos. Intenta nuevamente en 2 minutos.",
          confirmButtonColor: "#16243e",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al iniciar sesión",
          text: error.message || "Ocurrió un error inesperado.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#16243e",
        });
      }
    } finally {
      setLoadingLogin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col open-sans items-center justify-center h-screen">
        <BiLoaderCircle className="animate-spin size-28 text-azul-marino-500" />
        <p>Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('./Background.jpg')` }}
      />

      <div className="xl:w-1/2 lg:w-2/3 w-full ml-auto h-full flex items-center justify-center backdrop-blur-sm bg-white/20">
        <div className="lg:w-3/4 md:w-2/3 w-[90%] p-8 bg-white/80 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <img src="./Logo.png" alt="Logo" className="h-16" />
          </div>

          <h2 className="text-3xl font-semibold text-azul-marino-500 mb-6 text-center">
            Iniciar sesión
          </h2>

          <form onSubmit={handleLogin} autoComplete="off">
            <Grid container spacing={1}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="outlined-adornment-email">
                  Correo Electrónico
                </InputLabel>
                <OutlinedInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="outlined-adornment-email"
                  label="Correo Electrónico"
                  autoComplete="off"
                />
              </FormControl>

              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="outlined-adornment-password">
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <TbEyeClosed /> : <TbEye />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Contraseña"
                  autoComplete="off"
                />
              </FormControl>
            </Grid>

            <div className="flex items-center justify-between my-4">
              <a href="/recuperar-contrasena" className="text-sm text-azul-marino-500 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
              <a href="/register" className="text-sm text-azul-marino-500 hover:underline">
                ¿No tienes cuenta? Regístrate
              </a>
            </div>

            <div className="flex items-center justify-center">
              <button type="submit" disabled={loadingLogin || blocked}>
                {loadingLogin ? "Cargando..." : blocked ? `Espera ${timer}s` : "Iniciar Sesión"}
              </button>

              <button
                type="button"
                className={`bg-azul-marino-500 hover:bg-azul-marino-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  blocked ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => navigate("/register")}>
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
