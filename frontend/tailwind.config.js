/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: { 
    extend: {
      colors: {
        // Define your custom color palette here if needed
        dark: {
          primary: '#242424',
          secondary: '#1a1a1a',
          text: 'rgba(255, 255, 255, 0.87)'
        },
        light: {
          primary: '#f9fafb',
          secondary: '#f9f9f9',
          text: '#213547'
        }
      }
    } 
  },
  plugins: [],
};
