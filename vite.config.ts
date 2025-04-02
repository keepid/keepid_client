// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react()],
  // Add any extra config if needed (aliases, environment vars, etc.)
})
