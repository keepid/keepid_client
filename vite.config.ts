// vite.config.js
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import react from '@vitejs/plugin-react';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node'; // ✅ ADD THIS
import { type Plugin, defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { pwaConfig } from './vite.pwa.config';

const buildSha = process.env.VITE_BUILD_SHA || 'development';

const buildVersionPlugin = (): Plugin => ({
  name: 'keepid-build-version',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: `${JSON.stringify({ sha: buildSha })}\n`,
    });
  },
});

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [react(), buildVersionPlugin(), VitePWA(pwaConfig)],
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()], // ✅ Add this to support Buffer in production
    },
    outDir: 'dist',
  },
  // Add any extra config if needed (aliases, environment vars, etc.)
  optimizeDeps: {
    exclude: ['bootstrap'],
    include: ['buffer', 'process'],
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
});
