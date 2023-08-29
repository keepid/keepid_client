/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ...
      fontFamily: {
        body: ['Inter'],
        Raleway: ['Raleway'],
      },
      colors: {
        primaryLavender: '#E8E9FF',
        primaryPurple: '#445FEB',
        primary: '#445FEB',
        darkGray: '#6C757D',
        slateGray: '#94A3B8',
        blueGray: '#435673',
        slate700: '#334155',
        slate100: '#F1F5F9',
      },
    },
  },
  plugins: [],
};
