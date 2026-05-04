/**
 * Pure platform detection. No React, no globals beyond `navigator` and
 * `window.matchMedia`. Easy to unit-test by mocking `navigator.userAgent`.
 *
 * Why we need this:
 *  - iOS Safari does NOT fire `beforeinstallprompt`. We have to detect it
 *    explicitly and show manual "Tap Share → Add to Home Screen" instructions.
 *  - Android Chromium-based browsers do fire it, so we can call `.prompt()`.
 *  - Desktop browsers may or may not — we treat them like Android (try the
 *    event; if it doesn't fire, we never show the UI).
 */

import type { Platform } from './types';

export function detectPlatform(
  userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : '',
): Platform {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // iPad on iOS 13+ reports as desktop Safari unless we check `maxTouchPoints`.
  // We treat it as iOS so users get the right install instructions.
  const isIPadOS =
    typeof navigator !== 'undefined' &&
    navigator.platform === 'MacIntel' &&
    navigator.maxTouchPoints > 1;

  if (/iphone|ipad|ipod/.test(ua) || isIPadOS) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/macintosh|windows|linux|cros/.test(ua)) return 'desktop';

  return 'unknown';
}

/**
 * True when the page is being rendered as an installed PWA (standalone window).
 * In that case we hide the install nudge entirely.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const standaloneMatch = window.matchMedia?.(
    '(display-mode: standalone)',
  ).matches;

  // iOS Safari uses a non-standard `navigator.standalone` flag.
  const iosStandalone =
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return Boolean(standaloneMatch || iosStandalone);
}

/**
 * Specifically iOS Safari — the platform that needs manual install instructions
 * because Safari is the only browser engine on iOS that supports installation,
 * and it does so only via Share → Add to Home Screen.
 */
export function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (detectPlatform() !== 'ios') return false;

  const ua = navigator.userAgent.toLowerCase();
  // On iOS, all browsers are WebKit. Chrome iOS UA contains "crios", Firefox "fxios".
  // We allow installs from any iOS browser that supports the home-screen flow,
  // which is just Safari proper.
  return !/crios|fxios|edgios|opios/.test(ua);
}
