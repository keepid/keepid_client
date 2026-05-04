/**
 * React hook that exposes everything the UI needs to know about install state.
 *
 * The UI layer (components/InstallPrompt/*) consumes ONLY this hook — never
 * the browser event API directly. That's the boundary that keeps the UI
 * simple and the install logic centralized.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  hasStashedEvent,
  initInstallEvents,
  isAppInstalled,
  subscribe,
  triggerPrompt,
} from './installEvent';
import { detectPlatform, isStandalone } from './platform';
import type { InstallPromptState, Platform } from './types';

export function useInstallPrompt(): InstallPromptState {
  const [platform] = useState<Platform>(() => detectPlatform());
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => isStandalone() || isAppInstalled(),
  );
  const [canPromptNatively, setCanPromptNatively] = useState<boolean>(
    () => hasStashedEvent(),
  );

  useEffect(() => {
    initInstallEvents();

    const refresh = () => {
      setCanPromptNatively(hasStashedEvent());
      setIsInstalled(isStandalone() || isAppInstalled());
    };

    const unsubscribe = subscribe(refresh);
    refresh();

    return unsubscribe;
  }, []);

  const promptInstall = useCallback(async () => {
    return triggerPrompt();
  }, []);

  return {
    platform,
    isInstalled,
    canPromptNatively,
    promptInstall,
  };
}
