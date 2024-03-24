/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
  corePlugins: {
    preflight: false,
  },
  prefix: 'tw-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ...
      fontFamily: {
        body: ['Inter'],
      },
      colors: {
        twprimary: '#445FEB',
      },
    },
  },
  plugins: [],
});
