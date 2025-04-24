/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'rojo': {
          100: '#fde0df',
          200: '#fbb3b0',
          300: '#f88581',
          400: '#f55852',
          500: '#E11F1C',  // Color base
          600: '#be1917',
          700: '#9b1312',
          800: '#780e0e',
          900: '#560909',
        },
        'azul-marino': {
          100: '#e2e6ee',
          200: '#b5bdd3',
          300: '#8793b8',
          400: '#5a6a9d',
          500: '#16243e',  // Color base
          600: '#121e34',
          700: '#0e172a',
          800: '#0a111f',
          900: '#060a15',
        },
        'alerta': '#F4CE14',
        'exito': '#65B741',
        'error': '#FE0000',
        'info': '#4535C1',
      },
    },
  },
  plugins: [],
}

