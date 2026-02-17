/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A2342', // Deep blue from logo concept
        secondary: '#22d3ee', // Soft teal for accents
        'navy-blue-dark': '#0d244a',
      },
    },
  },
  plugins: [],
}
