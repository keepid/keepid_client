// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'; // ✅ ADD THIS

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()], // ✅ Add this to support Buffer in production
    },
  },
  // Add any extra config if needed (aliases, environment vars, etc.)
  optimizeDeps: {
    exclude: ['bootstrap'],
    include: ['buffer', 'process'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
});
