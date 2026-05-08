/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}','./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e' },
        saffron: { 400:'#fb923c',500:'#f97316',600:'#ea580c' },
      },
      fontFamily: { display:['Poppins','sans-serif'], body:['Inter','sans-serif'] },
    },
  },
  plugins: [],
}
