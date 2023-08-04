/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ...
      fontFamily: {
        body: ['Inter']
      },
      colors: {
        primary: '#445FEB',
      },
    },
  },
  plugins: [],
}
