/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        setu: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        calm: {
          slate: '#0b1120',
          card: '#111827',
          surface: '#182234',
          border: '#1f2d42',
          subtle: '#263852',
          cyan: '#38bdf8',
          teal: '#2dd4bf',
          emerald: '#34d399',
          indigo: '#818cf8',
          lavender: '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'glow-breathe': 'glow 3s ease-in-out infinite alternate',
        'bridge-flow': 'bridgeFlow 8s linear infinite',
        'shimmer-wave': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(45, 212, 191, 0.2), inset 0 0 10px rgba(45, 212, 191, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(45, 212, 191, 0.45), inset 0 0 15px rgba(45, 212, 191, 0.2)' },
        },
        bridgeFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
