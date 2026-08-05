import { registerSW } from 'virtual:pwa-register';

/**
 * Register through Workbox's update-aware client instead of the generated
 * one-line registration script. In auto-update mode this reloads the page
 * when a newly deployed worker activates, so the current tab cannot continue
 * rendering an older JavaScript/CSS bundle under the new worker.
 */
export const registerServiceWorker = () => {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      // A registration failure should never prevent the main application
      // from loading, but it should remain diagnosable in browser logs.
      console.error('[PWA] Service worker registration failed.', error);
    },
  });
};
