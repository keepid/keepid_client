/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
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
        twprimary: '#445FEB',
        footerblack: '#1D1D1D',
      },
    },
  },
  plugins: [],
}
