/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: 'rgba(255,255,255,0.6)',
        darkglass: 'rgba(0,0,0,0.5)'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.08)',
        softdark: '0 10px 30px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}
