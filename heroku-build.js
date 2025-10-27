// heroku-build.js
const { execSync } = require('child_process');

const mode = process.env.VITE_MODE || 'production';
console.log(`Building with Vite mode: ${mode}`);
execSync(`npx vite build --mode ${mode}`, { stdio: 'inherit' });