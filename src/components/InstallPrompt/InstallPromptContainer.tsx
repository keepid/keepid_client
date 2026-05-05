/**
 * Smart wrapper that decides whether and what to render for the install nudge.
 *
 * This is the SINGLE integration point — the only file in `InstallPrompt/`
 * that App.tsx imports. It owns visibility state and routes to the correct
 * platform-specific content component.
 *
 * Open/dismiss policy (per product decision):
 *  - Show on every login session, dismissible.
 *  - "Dismissed this session" is remembered in sessionStorage so the user
 *    is not nagged repeatedly within one tab session, but reappears on the
 *    next login.
 *  - Hidden entirely if the app is already installed (display-mode standalone).
 *
 * Android-specific: we wait up to ANDROID_EVENT_WAIT_MS for
 * `beforeinstallprompt` before opening. Chrome only fires that event once its
 * engagement heuristics are satisfied (typically 2+ visits, 5+ min apart).
 * If the event never fires in time we skip the modal rather than showing a
 * disabled Install button.
 *
 * iOS has no install event so we open immediately.
 */

import React, { useEffect, useRef, useState } from 'react';

import { pwaLog } from '../../lib/pwa/logger';
import { useDismissalMemory } from '../../lib/pwa/useDismissalMemory';
import { useInstallPrompt } from '../../lib/pwa/useInstallPrompt';
import AndroidContent from './content/AndroidContent';
import IOSContent from './content/IOSContent';
import InstallPromptErrorBoundary from './InstallPromptErrorBoundary';
import InstallPromptModal from './InstallPromptModal';

/** How long to wait for beforeinstallprompt before giving up for this session. */
const ANDROID_EVENT_WAIT_MS = 5000;

interface Props {
  /**
   * Change this value to (re-)open the modal. Typically set to the logged-in
   * username so each login session triggers exactly one open.
   * Pass `null` / empty string when logged out — the modal will not open.
   */
  triggerKey: string | null;
}

function InstallPromptContainerInner({ triggerKey }: Props) {
  const { platform, isInstalled, canPromptNatively, promptInstall } =
    useInstallPrompt();
  const { dismissedThisSession, markDismissed } = useDismissalMemory();

  const [open, setOpen] = useState(false);
  const [lastSeenTriggerKey, setLastSeenTriggerKey] = useState<string | null>(null);
  // True while we're waiting for beforeinstallprompt on Android.
  const [pendingAndroidOpen, setPendingAndroidOpen] = useState(false);
  const androidTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Called when triggerKey changes (i.e. user just logged in).
  useEffect(() => {
    if (!triggerKey) return;
    if (triggerKey === lastSeenTriggerKey) return;

    setLastSeenTriggerKey(triggerKey);

    if (isInstalled) { pwaLog('skipping: already installed'); return; }
    if (dismissedThisSession) { pwaLog('skipping: dismissed this session'); return; }
    if (platform !== 'ios' && platform !== 'android') { pwaLog('skipping: desktop'); return; }

    if (platform === 'ios') {
      pwaLog('opening iOS prompt immediately');
      setOpen(true);
      return;
    }

    // Android: open now if we already have the event, otherwise wait.
    if (canPromptNatively) {
      pwaLog('opening Android prompt (event already stashed)');
      setOpen(true);
    } else {
      pwaLog('Android: waiting up to', ANDROID_EVENT_WAIT_MS, 'ms for beforeinstallprompt');
      setPendingAndroidOpen(true);
    }
  }, [triggerKey, lastSeenTriggerKey, isInstalled, dismissedThisSession, platform, canPromptNatively]);

  // When the event fires while we're pending, open the modal.
  useEffect(() => {
    if (!pendingAndroidOpen || !canPromptNatively) return;
    pwaLog('beforeinstallprompt arrived while pending — opening Android prompt');
    setPendingAndroidOpen(false);
    if (androidTimeoutRef.current) clearTimeout(androidTimeoutRef.current);
    setOpen(true);
  }, [pendingAndroidOpen, canPromptNatively]);

  // Timeout: if event never fires, cancel the pending open silently.
  useEffect(() => {
    if (!pendingAndroidOpen) return;
    androidTimeoutRef.current = setTimeout(() => {
      pwaLog('beforeinstallprompt did not fire within timeout — skipping modal this session');
      setPendingAndroidOpen(false);
    }, ANDROID_EVENT_WAIT_MS);
    return () => {
      if (androidTimeoutRef.current) clearTimeout(androidTimeoutRef.current);
    };
  }, [pendingAndroidOpen]);

  const handleDismiss = () => {
    markDismissed();
    setOpen(false);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    pwaLog('install outcome:', outcome);
    setOpen(false);
    if (outcome !== 'accepted') {
      markDismissed();
    }
  };

  if (!open) return null;

  return (
    <InstallPromptModal open={open} onClose={handleDismiss}>
      {platform === 'ios' && <IOSContent onDismiss={handleDismiss} />}
      {platform === 'android' && (
        <AndroidContent
          canPromptNatively={canPromptNatively}
          onInstall={handleInstall}
          onDismiss={handleDismiss}
        />
      )}
    </InstallPromptModal>
  );
}

export default function InstallPromptContainer(props: Props) {
  return (
    <InstallPromptErrorBoundary>
      <InstallPromptContainerInner {...props} />
    </InstallPromptErrorBoundary>
  );
}
