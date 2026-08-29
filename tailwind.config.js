/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sap: {
          dark: '#0B111E',
          card: '#131D31',
          border: '#1E2D4A',
          muted: '#8B9BB4',
          accent: '#0A84FF',
          gold: '#F5A623',
          emerald: '#30D158',
          crimson: '#FF453A',
          cyan: '#64D2FF',
          purple: '#BF5AF2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
