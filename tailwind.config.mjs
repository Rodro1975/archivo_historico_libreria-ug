// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Por si tienes archivos en src
  ],
  
  theme: {
    extend: {
      colors: {
        blue: "var(--color-blue)",
        yellow: "var(--color-yellow)",
        gold: "var(--color-gold)",
        orange: "var(--color-orange)",
      },
      fontFamily: {
        "geist-sans": ["var(--font-geist-sans)"],
        "geist-mono": ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};


