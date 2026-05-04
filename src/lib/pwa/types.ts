/**
 * Shared types for the PWA install feature.
 *
 * The `BeforeInstallPromptEvent` is not in standard TypeScript DOM types
 * (it's a Chromium-only addition), so we declare it here once and reference
 * it from `installEvent.ts`. Future devs: this is the only place this type
 * is defined.
 */

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

export type InstallOutcome = 'accepted' | 'dismissed';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: InstallOutcome;
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * State returned by `useInstallPrompt`. The UI layer should consume only
 * this shape, not the underlying browser event.
 */
export interface InstallPromptState {
  /** Detected platform of the current browser. */
  platform: Platform;
  /** True iff the app is already running in standalone (installed) mode. */
  isInstalled: boolean;
  /**
   * True iff we have a stashed `beforeinstallprompt` event we can fire.
   * On iOS this will always be false — iOS Safari has no programmatic install.
   */
  canPromptNatively: boolean;
  /** Triggers the native browser install dialog. Resolves with the user's choice. */
  promptInstall: () => Promise<InstallOutcome | null>;
}
