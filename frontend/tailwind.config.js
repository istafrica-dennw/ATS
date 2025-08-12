/** @type {import('tailwindcss').Config} 
 * Enhanced with comprehensive dark mode support
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enables manual dark mode switching via a 'dark' class
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 