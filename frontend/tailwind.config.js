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
          dark: '#080e1a',
          navy: '#0b1329',
          card: '#0f172a',
          border: '#1e293b',
          accent: '#00e699',
          accentHover: '#00cc88',
          blue: '#0284c7',
          cyan: '#06b6d4',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
