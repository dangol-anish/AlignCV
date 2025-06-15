/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // include if you use /app structure (Next.js)
  ],
  theme: {
    extend: {
      colors: {
        "royal-blue": "#4169e1",
      },
    },
  },
  plugins: [],
};
