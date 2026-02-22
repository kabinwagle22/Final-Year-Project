/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'med-blue': '#007BFF',
          'med-teal': '#00A8A8',
        }
      },
    },
    plugins: [],
  }