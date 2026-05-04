/**
 * PWA configuration for keepid_client.
 *
 * This file is the single source of truth for:
 *  - The Web App Manifest (name, icons, colors, shortcuts, display mode)
 *  - The Service Worker / Workbox precache + runtime caching strategy
 *
 * Edit this file when:
 *  - Changing the installed-app name, icon, or theme colors
 *  - Adding / removing app shortcuts (long-press menu on the icon)
 *  - Adjusting offline caching behavior
 *
 * IMPORTANT — privacy:
 *  The runtime cache is intentionally limited to the static app shell
 *  (HTML / JS / CSS / icons). We do NOT cache API responses or user
 *  documents in the service worker. Caching PII would be a regression
 *  on Keep.ID's threat model.
 */

import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-icon-180x180.png',
  ],
  manifest: {
    name: 'Keep.ID',
    short_name: 'Keep.ID',
    description:
      'Safeguarding the identities of those experiencing homelessness. Quick access to your core documents and document scanner.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#000000',
    background_color: '#ffffff',
    lang: 'en',
    icons: [
      { src: '/android-icon-36x36.png', sizes: '36x36', type: 'image/png' },
      { src: '/android-icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { src: '/android-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: '/android-icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/android-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      {
        src: '/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'My Documents',
        short_name: 'Documents',
        description: 'Open your stored documents',
        url: '/my-documents',
        icons: [{ src: '/android-icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Scan a Document',
        short_name: 'Scan',
        description: 'Scan a new document with the camera',
        url: '/upload-document?mode=scan',
        icons: [{ src: '/android-icon-192x192.png', sizes: '192x192' }],
      },
    ],
  },
  workbox: {
    // Precache the built app shell. Keep this list narrow on purpose.
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    // The main bundle is ~3.5 MB today (Bootstrap + jsonforms + react-pdf, etc.).
    // Bump this if the bundle grows further; consider code-splitting instead.
    maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
    // SPA fallback — any unknown route returns index.html so React Router can handle it offline.
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [
      // API + auth routes must hit the network, never the cache.
      /^\/api\//,
      /^\/login/,
      /^\/logout/,
      /^\/authenticate/,
    ],
    // No runtimeCaching for API/document responses — see privacy note above.
    runtimeCaching: [],
    cleanupOutdatedCaches: true,
  },
  devOptions: {
    // Enable the SW in `npm start` so devs can test install behavior locally.
    enabled: false,
    type: 'module',
    navigateFallback: 'index.html',
  },
};
