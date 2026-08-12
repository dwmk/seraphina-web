/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./api/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        seraphina: {
          dark: '#09090b',
          accent: '#ec4899',
        }
      },
    },
  },
  plugins: [],
};
