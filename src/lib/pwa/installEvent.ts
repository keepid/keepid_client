/**
 * Single point of contact with the browser's `beforeinstallprompt` API.
 *
 * NO other file in the codebase should listen for this event. Adding more
 * listeners causes bugs because the event can only be `prompt()`-ed once.
 *
 * Lifecycle:
 *  1. Browser decides the app is installable → fires `beforeinstallprompt`.
 *  2. We `preventDefault()` to suppress Chrome's mini-infobar so we control
 *     when the dialog appears.
 *  3. We stash the event and notify subscribers.
 *  4. UI eventually calls `triggerPrompt()` → calls `event.prompt()` exactly once.
 *  5. Browser also fires `appinstalled` once the user installs — we clear state.
 */

import { pwaLog } from './logger';
import type { BeforeInstallPromptEvent, InstallOutcome } from './types';

type Listener = () => void;

let stashedEvent: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();
let initialized = false;

function notify(): void {
  listeners.forEach((l) => {
    try {
      l();
    } catch (err) {
      console.error('[PWA] listener threw', err);
    }
  });
}

/**
 * Idempotent. Safe to call multiple times — only the first call wires up
 * the actual window listeners.
 */
export function initInstallEvents(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    pwaLog('beforeinstallprompt fired');
    e.preventDefault();
    stashedEvent = e as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    pwaLog('appinstalled fired');
    installed = true;
    stashedEvent = null;
    notify();
  });
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasStashedEvent(): boolean {
  return stashedEvent !== null;
}

export function isAppInstalled(): boolean {
  return installed;
}

/**
 * Fires the native install dialog. Returns the user's choice, or `null` if
 * we have no stashed event (e.g., browser hasn't deemed us installable yet,
 * or we're on iOS).
 *
 * After a successful prompt, the browser will not re-fire `beforeinstallprompt`
 * for ~90 days even if the user dismisses. This is by design.
 */
export async function triggerPrompt(): Promise<InstallOutcome | null> {
  if (!stashedEvent) {
    pwaLog('triggerPrompt called but no stashed event');
    return null;
  }
  const event = stashedEvent;
  stashedEvent = null;
  notify();

  try {
    await event.prompt();
    const choice = await event.userChoice;
    pwaLog('user choice:', choice.outcome);
    return choice.outcome;
  } catch (err) {
    console.error('[PWA] prompt() threw', err);
    return null;
  }
}
