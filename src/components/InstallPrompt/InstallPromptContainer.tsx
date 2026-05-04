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
 * To trigger the modal, set `triggerKey` to a new value (e.g., username + login
 * timestamp). Each new value reopens the modal as long as the user hasn't
 * already dismissed in this session.
 */

import React, { useEffect, useState } from 'react';

import { pwaLog } from '../../lib/pwa/logger';
import { useDismissalMemory } from '../../lib/pwa/useDismissalMemory';
import { useInstallPrompt } from '../../lib/pwa/useInstallPrompt';
import AndroidContent from './content/AndroidContent';
import IOSContent from './content/IOSContent';
import InstallPromptErrorBoundary from './InstallPromptErrorBoundary';
import InstallPromptModal from './InstallPromptModal';

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
  const [lastSeenTriggerKey, setLastSeenTriggerKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!triggerKey) return;
    if (triggerKey === lastSeenTriggerKey) return;

    setLastSeenTriggerKey(triggerKey);

    if (isInstalled) {
      pwaLog('skipping prompt: already installed');
      return;
    }
    if (dismissedThisSession) {
      pwaLog('skipping prompt: dismissed this session');
      return;
    }
    if (platform !== 'ios' && platform !== 'android') {
      pwaLog('skipping prompt: not a mobile platform (', platform, ')');
      return;
    }

    pwaLog('opening install prompt for platform:', platform);
    setOpen(true);
  }, [triggerKey, lastSeenTriggerKey, isInstalled, dismissedThisSession, platform]);

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
