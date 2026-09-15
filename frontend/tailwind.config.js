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
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dbfe',
          300: '#a4c4fd',
          400: '#7aa4fb',
          500: '#4f7df6',
          600: '#345ded',
          700: '#2646d8',
          800: '#2339ae',
          900: '#1e328a',
          950: '#172154',
        },
        matte: {
          blue: '#1e3a8a',
          dark: '#0f172a',
          surface: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
          subtle: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'matte': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'matte-md': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'matte-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
