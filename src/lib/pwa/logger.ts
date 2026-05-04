/**
 * Prefixed PWA logger. No-op in production, verbose in dev.
 *
 * Usage: `pwaLog('beforeinstallprompt fired', event)`
 *
 * In dev you'll see `[PWA] beforeinstallprompt fired ...` in the browser
 * console. Filter the console for `[PWA]` to trace install behavior.
 */

const PREFIX = '[PWA]';

export function pwaLog(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log(PREFIX, ...args);
  }
}

export function pwaWarn(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.warn(PREFIX, ...args);
  }
}

export function pwaError(...args: unknown[]): void {
  // Errors always log, even in prod — these indicate real bugs.
  console.error(PREFIX, ...args);
}
