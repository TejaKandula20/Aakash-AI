/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kisan: {
          50: '#f2f9f0',
          100: '#e1f2dc',
          200: '#c5e6bc',
          300: '#9ed390',
          400: '#72ba60',
          500: '#4e9e3c',
          600: '#3c802e',
          700: '#316527',
          800: '#2a5122',
          900: '#24441f',
        },
        skycast: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite'
      }
    },
  },
  plugins: [],
}
