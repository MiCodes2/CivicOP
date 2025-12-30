/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        city: process.env.NEXT_PUBLIC_THEME_CITY || '#F9A825',
        water: process.env.NEXT_PUBLIC_THEME_WATER || '#3B99D9',
        transport: process.env.NEXT_PUBLIC_THEME_TRANSPORT || '#D32F2F',
        greenspace: process.env.NEXT_PUBLIC_THEME_GREEN || '#388E3C',
        appbg: process.env.NEXT_PUBLIC_THEME_BG || '#FFFFFF',
      }
    },
  },
  plugins: [],
}