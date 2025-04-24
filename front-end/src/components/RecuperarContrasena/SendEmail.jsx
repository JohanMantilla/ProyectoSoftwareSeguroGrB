import React, { useState } from 'react';
import { forgotPassword } from '../../services/auth/auth';
import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import Swal from 'sweetalert2';

export const SendEmail = ({ onEmailSent }) => {

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');



  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      // Enviar correo
      await forgotPassword(email);
      // Redirigir a la página de inicio de sesión
      Swal.fire({
        title: 'Correo enviado',
        text: 'Hemos enviado un token a tu correo para que puedas reestablecer tu contraseña',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#16243e',
      });
    } catch (error) {
      console.error('Error al enviar el correo:', error.message);
      Swal.fire({
        title: 'Error al enviar el correo',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#16243e',
      });
    } finally {
      setLoadingEmail(false);
      onEmailSent();
    }

  }
  return (
    <div className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-[90%]  p-8 bg-white/80 rounded-lg shadow-lg">

      {/* Logo */}
      <div className="flex justify-center mb-4">
        <img src="./Logo.png" alt="Logo" className="h-20" />
      </div>

      {/* Título */}
      <h2 className="text-3xl font-semibold text-azul-marino-500 mb-4 text-center">
        Olvidaste tu contraseña?
      </h2>

      {/* Párrafo */}
      <p className="text-stone-600 mb-6 text-center">
        No te preocupes, enviaremos un link a tu correo para que puedes reestablecer tu contraseña                    </p>

      {/* Formulario */}
      <form onSubmit={handleSendEmail}>
        {/* Campo de Correo Electrónico */}
        <FormControl
          fullWidth
          variant="outlined"
          size='small'
        >
          <InputLabel
            sx={{
              fontSize: window.innerWidth < 640 ? '0.875rem' : '1rem',
            }}
            htmlFor="outlined-adornment-email"
          >
            Correo Electrónico
          </InputLabel>
          <OutlinedInput
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="outlined-adornment-email"
            label="Correo Electrónico"
          />
        </FormControl>

        {/* Botón de Enviar */}
        <div className="flex items-center justify-center pt-4">
          <button
            type="submit"
            className="bg-azul-marino-500 hover:bg-azul-marino-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loadingEmail}
          >
            {loadingEmail ? 'Cargando...' : 'Enviar Enlace'}

          </button>
        </div>
      </form>
    </div>
  )
}
