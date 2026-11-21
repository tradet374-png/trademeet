/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        'surface-dark': '#151B2B',
        'surface-card': '#1A2234',
        'surface-hover': '#242F48',
        'border-dark': '#232D42',
        accent: {
          DEFAULT: '#00C896',
          hover: '#00B083',
          light: 'rgba(0, 200, 150, 0.15)',
        },
        danger: {
          DEFAULT: '#FF4B55',
          hover: '#E03E48',
          light: 'rgba(255, 75, 85, 0.15)',
        },
        warning: '#F59E0B',
        info: '#3B82F6',
        text: {
          primary: '#FFFFFF',
          secondary: '#929BAD',
          muted: '#5F6B84',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 2s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1.0)' },
        }
      }
    },
  },
  plugins: [],
}
