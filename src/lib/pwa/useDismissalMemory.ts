/**
 * React hook tracking whether the user has dismissed the install nudge in
 * the current browser session.
 *
 * Per the user's product decision, the nudge re-appears every login session.
 * We use `sessionStorage` (cleared when the tab is closed / browser session
 * ends) instead of `localStorage` so the nudge surfaces again next time.
 *
 * If you ever want a longer dismissal cooldown (e.g. 7 days), swap this out
 * for a `localStorage` entry with a timestamp — only this file would change.
 */

import { useCallback, useState } from 'react';

import { pwaLog } from './logger';

const STORAGE_KEY = 'keepid:pwa:dismissedThisSession';

function readInitial(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export interface DismissalMemory {
  dismissedThisSession: boolean;
  markDismissed: () => void;
  clearDismissal: () => void;
}

export function useDismissalMemory(): DismissalMemory {
  const [dismissedThisSession, setDismissed] = useState<boolean>(readInitial);

  const markDismissed = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
      pwaLog('marked dismissed for this session');
    } catch {
      // sessionStorage may be unavailable in private mode — best effort only.
    }
    setDismissed(true);
  }, []);

  const clearDismissal = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // No-op.
    }
    setDismissed(false);
  }, []);

  return { dismissedThisSession, markDismissed, clearDismissal };
}
