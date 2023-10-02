const defaultTheme = require('tailwindcss/defaultTheme');
const { rootCertificates } = require('tls');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        gradient: 'gradient 10s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%': {
            "background-position": '0% 50%',
          },
          '50%': {
            "background-position": '100% 50%',
          },
          '100%': {
            "background-position": '0% 50%',
          }
        }
      }
    }
  }
}
