/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: '#090a10',
        primary: '#0f111a',
        secondary: '#171a27',
        card: '#1f2335',
        'card-hover': '#262b41',
        gold: {
          DEFAULT: '#e5b974',
          light: '#f7d89c',
          dark: '#b8893d'
        },
        amber: {
          glow: '#f59e0b'
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Crimson Pro', 'serif'],
        reading: ['Crimson Pro', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
