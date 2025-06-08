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
        raleway: ['Raleway', 'sans-serif'],
      },
      colors: {
        twprimary: '#445FEB',
        'primary-theme': '#445feb',
        'secondary-text-color': '#b7b7c0',
        'secondary-theme': '#413f57',
        footerblack: '#1D1D1D',
      },
    },
  },
  plugins: [],
});
