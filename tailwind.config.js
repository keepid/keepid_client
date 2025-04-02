/** @type {import('tailwindcss').Config} */
const withMT = require('@material-tailwind/react/utils/withMT');

module.exports = withMT({
  corePlugins: {
    preflight: false,
  },
  prefix: 'tw-',
  // 1) Add './index.html' and `.{scss}` if you use classes in .scss
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,scss}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter'],
      },
      colors: {
        twprimary: '#445FEB',
        footerblack: '#1D1D1D',
      },
    },
  },
  plugins: [],
});
