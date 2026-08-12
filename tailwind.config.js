/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // UPDATED PATH for Vite
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mux: {
          dark: '#050202',   
          orange: '#ff7b00',
          red: '#ff2a2a',   
          gold: '#ffd700',   
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
};
