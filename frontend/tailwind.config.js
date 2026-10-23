/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#64ad89',
          400: '#16845e',
          500: '#117451',
          600: '#0c6245',
          700: '#0b553e',
          800: '#08432f',
          900: '#063522',
          950: '#022c22',
        },
        emerald: {
          50: '#effaf3',
          100: '#d8f1e0',
          200: '#b6e1c7',
          300: '#64ad89',
          400: '#16845e',
          500: '#117451',
          600: '#0c6245',
          700: '#0b553e',
          800: '#08432f',
          900: '#063522',
          950: '#032a1c',
        },
        slate: {
          100: '#17251d',
          200: '#2b3b32',
          300: '#425148',
          400: '#5b6961',
          500: '#69776f',
          600: '#829087',
          700: '#cbd4cc',
          800: '#e4e9e3',
          850: '#edf1ec',
          900: '#ffffff',
          950: '#f6f7f3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
