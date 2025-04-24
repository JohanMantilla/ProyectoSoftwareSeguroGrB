import React, { useState } from 'react';
import { resetPassword } from '../../services/auth/auth'
import { FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate } from 'react-router-dom';
import { validateResetPassword } from '../../services/auth/validateAuthForm'
import { TbEye, TbEyeClosed } from "react-icons/tb";
import Swal from 'sweetalert2'

export const ResetPasswordForm = () => {
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [errors, setErrors] = useState([]);

    const navigate = useNavigate();
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors(validateResetPassword(token, password, confirmPassword));
        if (errors.length > 0) {
            Swal.fire({
                title: 'Formato incorrecto',
                text: errors[0],
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#16243e',
            });
            return;
        } else {
            setErrors([]);
            setLoadingReset(true);
            try {
                await resetPassword(token, password);
                // Redirigir a la página de inicio de sesión
                Swal.fire({
                    title: 'Contraseña reestablecida',
                    text: 'Tu contraseña ha sido reestablecida con éxito',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#16243e',
                }).then(() => {
                    navigate('/login');
                });
            } catch (error) {
                console.error('Error al reestablecer la contraseña:', error.message);
                Swal.fire({
                    title: 'Error al reestablecer la contraseña',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#16243e',
                });
            }
        }

    }

    return (
        <div className="xl:w-1/3 lg:w-1/2 md:w-2/3 w-[90%]  p-8 bg-white/80 rounded-lg shadow-lg">

            {/* Logo */}
            <div className="flex justify-center mb-4">
                <img src="./PoliGymLogo.png" alt="PoliGym Logo" className="h-20" />
            </div>

            {/* Título */}
            <h2 className="text-3xl font-semibold text-azul-marino-500 mb-4 text-center">
                Reestablecer Contraseña
            </h2>


            {/* Formulario */}
            <form onSubmit={handleResetPassword} autoComplete='off'>
                <Grid container spacing={1}
                    sx={{
                        '& .MuiFormLabel-root':
                        {
                            fontFamily: 'Open Sans',
                        },
                    }}>
                    {/* Campo de token */}
                    <FormControl
                        fullWidth
                        variant="outlined"
                        size='small'
                        autoComplete='off'
                    >
                        <InputLabel
                            sx={{
                                fontSize: window.innerWidth < 640 ? '0.875rem' : '1rem',
                            }}
                            htmlFor="outlined-adornment-token"
                        >
                            Token
                        </InputLabel>
                        <OutlinedInput
                            type='text'
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            id="outlined-adornment-token"
                            label="Token"
                            autoComplete='off'
                        />
                    </FormControl>


                    {/* Campo de contraseña */}
                    <FormControl

                        fullWidth
                        variant="outlined"
                        size='small'
                    >
                        <InputLabel
                            sx={{
                                fontSize: window.innerWidth < 640 ? '0.875rem' : '1rem',
                            }}
                            htmlFor="outlined-adornment-password"
                        >
                            Contraseña
                        </InputLabel>
                        <OutlinedInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showPassword ? 'hide the password' : 'display the password'
                                        }
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <TbEyeClosed /> : <TbEye />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Contraseña"
                            autoComplete='off'
                        />
                    </FormControl>
                    <FormControl

                        fullWidth
                        variant="outlined"
                        size='small'
                    >
                        <InputLabel
                            sx={{
                                fontSize: window.innerWidth < 640 ? '0.875rem' : '1rem',
                            }}
                            htmlFor="outlined-adornment-confirm-password"
                        >
                            Confirmar Contraseña
                        </InputLabel>
                        <OutlinedInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="outlined-adornment-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={
                                            showConfirmPassword ? 'hide the confirm-password' : 'display the confirm-password'
                                        }
                                        onClick={handleClickShowConfirmPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <TbEyeClosed /> : <TbEye />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Confirmar Contraseña"
                            autoComplete='off'
                        />
                    </FormControl>


                </Grid>
                {/* Botón de Enviar */}
                <div className="flex items-center justify-center pt-4">
                    <button
                        type="submit"
                        className="bg-azul-marino-500 hover:bg-azul-marino-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        disabled={loadingReset}
                    >
                        {loadingReset ? 'Cargando...' : 'Reestablecer Contraseña'}

                    </button>
                </div>
            </form>
        </div>
    )
}
