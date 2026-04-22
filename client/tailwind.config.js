/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f3ff',
          magenta: '#ff00ea',
          purple: '#b026ff',
          green: '#39ff14',
          yellow: '#fbff00'
        },
        dark: {
          900: 'var(--dark-900)',
          800: 'var(--dark-800)',
          700: 'var(--dark-700)',
          600: 'var(--dark-600)'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace']
      }
    },
  },
  plugins: [],
}
