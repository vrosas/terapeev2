/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF', 100: '#DCE5FF', 200: '#B9CBFF', 300: '#8FACFF',
          400: '#5F8DFF', 500: '#3F6BFF', 600: '#2E55E6', 700: '#2244BD',
          800: '#183494', 900: '#0F236B',
        },
        wa: { DEFAULT: '#25D366', dark: '#075E54', light: '#DCF8C6', bg: '#E7F8ED' },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-slide-up': 'fadeSlideUp 0.25s ease both',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px) scale(0.98)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
        fadeSlideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
