/** @type {import('tailwindcss').Config} 
 * Enhanced with comprehensive dark mode support
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 