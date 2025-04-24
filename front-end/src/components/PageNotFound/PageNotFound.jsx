import React from 'react'
import { TbRocket } from "react-icons/tb";

export const PageNotFound = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-stone-100 relative">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('./gym.jpg')` }}
            />

            {/* Contenedor principal */}
            <div className="relative w-full h-full flex items-center justify-center backdrop-blur-sm bg-white/20">
                <div className="lg:w-1/2 md:w-2/3 w-[90%] md:h-[80%] h-2/3 p-8 bg-white/70 rounded-lg shadow-lg flex flex-col justify-evenly items-center">
                    {/* Logo */}
                    <div className="mb-4">
                        <img src="./PoliGymLogo.png" alt="PoliGym Logo" className="h-24" />
                    </div>

                    <div>
                        {/* Ícono 404 */}
                        <div className="mb-4 text-azul-marino-500 flex justify-center">
                            <TbRocket className='md:size-20 size-14' />
                        </div>

                        {/* Texto 404 */}
                        <h1 className="text-5xl text-center font-bold text-azul-marino-500 mb-2">404</h1>
                    </div>

                    <div>
                        {/* Título */}
                        <h2 className="text-2xl text-center font-semibold text-stone-900 mb-4">Página no encontrada</h2>

                        {/* Párrafo */}
                        <p className="text-stone-700 text-center">
                            La página a la que está intentando acceder no existe.
                        </p>
                        <p className='text-stone-700 mb-6 text-center'>
                            Haga clic en el botón para regresara a la página principal
                        </p>
                    </div>

                    {/* Botón para regresar al inicio 
                        VERIFICAR QUE EL USUARIO ESTE LOGUEADO PARA REDIRECCIONARLO A LA PÁGINA DE INICIO
                    */}
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-azul-marino-500 hover:bg-azul-marino-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    )
}
