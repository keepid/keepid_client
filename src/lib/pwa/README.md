# `lib/pwa/` — PWA install logic

This folder contains all non-UI code for the **"Install Keep.ID as an app"**
feature. The matching UI lives in `src/components/InstallPrompt/`.

## Architecture

```
                        ┌──────────────────────────┐
                        │  components/InstallPrompt│   (UI layer)
                        │     uses useInstallPrompt│
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │   useInstallPrompt.ts    │   (React hook)
                        │   exposes: platform,     │
                        │   canPromptNatively,     │
                        │   isInstalled, prompt()  │
                        └────────────┬─────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
┌───────────────┐          ┌─────────────────┐         ┌──────────────────────┐
│  platform.ts  │          │ installEvent.ts │         │ useDismissalMemory.ts│
│ pure platform │          │  ONLY file that │         │ sessionStorage I/O   │
│  detection    │          │  touches the    │         │ for dismissal state  │
│ (no globals)  │          │  browser API    │         │                      │
└───────────────┘          └─────────────────┘         └──────────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   logger.ts      │
                            │ `[PWA]`-prefixed │
                            │  console output  │
                            └──────────────────┘

           types.ts — shared TS types incl. BeforeInstallPromptEvent
```

## Where to look when X breaks

| Symptom | First file to check |
|---|---|
| Install button does nothing on Android | `installEvent.ts` (is `triggerPrompt` being called?) |
| `beforeinstallprompt` never fires | `installEvent.ts` listener wiring + DevTools → Application → Manifest tab (manifest invalid?) |
| iOS shows the wrong UI | `platform.ts` `detectPlatform()` and `isIOSSafari()` |
| App keeps showing the install nudge after install | `installEvent.ts` `appinstalled` listener; `platform.ts` `isStandalone()` |
| Nudge shows even though user dismissed it | `useDismissalMemory.ts` |
| Nudge never re-appears after dismissal | `useDismissalMemory.ts` (currently uses sessionStorage on purpose) |
| Need to change app name / icons / shortcuts | `vite.pwa.config.ts` (project root, NOT here) |
| Service worker never registers | `vite.pwa.config.ts` and run `npm run build` (SW only registers in production builds by default) |

## Debugging tips

1. Open DevTools → Console and filter by `[PWA]`. Every state transition is logged in dev.
2. DevTools → Application → Manifest shows the parsed manifest. Errors here = no install prompt.
3. DevTools → Application → Service Workers shows SW registration status.
4. To force-test the install prompt on Chrome desktop: visit `chrome://flags/#bypass-app-banner-engagement-checks`, enable, restart. Otherwise Chrome waits for "engagement" before firing `beforeinstallprompt`.
5. iOS has no install prompt event — the `IOSContent.tsx` component is shown unconditionally on iOS Safari (when not already installed and not dismissed this session).

## Why these layers?

- **`platform.ts` is pure** so it can be unit-tested without a browser. iOS / Android detection is the most fragile bit and the most worth testing.
- **`installEvent.ts` is the only browser-API consumer.** If Chrome ever changes the event semantics, you change one file.
- **`useDismissalMemory.ts` isolates persistence.** Want to switch from per-session to per-week dismissal? One file changes.
- **The UI consumes `useInstallPrompt` only.** That single hook is the contract between logic and UI.

## Privacy note

The service worker (`vite.pwa.config.ts` → `workbox`) intentionally caches
**only the static app shell** — JS, CSS, HTML, icons. We do **not** cache API
responses or user documents. Caching PII would be a regression on Keep.ID's
threat model. Do not add API runtime caching here without a security review.
