/**
 * PWA configuration for keepid_client.
 *
 * This file is the single source of truth for:
 *  - The Web App Manifest (name, icons, colors, shortcuts, display mode)
 *  - The Service Worker / Workbox caching strategy
 *
 * Edit this file when:
 *  - Changing the installed-app name, icon, or theme colors
 *  - Adding / removing app shortcuts (long-press menu on the icon)
 *  - Adjusting offline caching behavior
 *
 * IMPORTANT — privacy:
 *  The service worker intentionally does not cache the application shell,
 *  API responses, or user documents. Each visit must load the current HTML,
 *  JavaScript, and CSS from the server so separate browser profiles cannot
 *  remain on different releases. Caching PII would also be a regression on
 *  Keep.ID's threat model.
 */

import type { VitePWAOptions } from 'vite-plugin-pwa';

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  // Registration is handled in src/lib/pwa/registerServiceWorker.js so the
  // page reloads as soon as an updated worker takes control.
  injectRegister: false,
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
    // Do not precache the app shell. The explicitly listed manifest icons
    // above remain available to the installed PWA, while all UI code and
    // styling are fetched from the current deployment.
    globPatterns: [],
    navigateFallback: null,
    // No runtime caching for API/document responses or application assets.
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
