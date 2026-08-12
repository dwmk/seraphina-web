/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./api/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        seraphina: {
          dark: '#18181b',
          accent: '#ec4899',
        }
      },
    },
  },
  plugins: [],
};
