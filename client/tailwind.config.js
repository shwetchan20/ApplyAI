/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        mint: "#0f766e",
        sky: "#0284c7",
        paper: "#f8fafc"
      }
    }
  },
  plugins: []
};