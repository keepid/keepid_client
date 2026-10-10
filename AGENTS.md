# Agent guide: keepid_client

Keep.id client: a React 18 + Vite + TypeScript single-page app.

## Commands

- `npm start`: Vite dev server on http://localhost:3000. In dev, API calls go to http://localhost:7001 (see `src/serverOverride.ts`).
- `npm run build`: production build into `dist/`.
- `npm run lint:ts`: ESLint for TypeScript and TSX.
- `npm run lint:scss`: Stylelint for SCSS.
- `npx vitest run`: unit tests. `npm test` is a placeholder and runs nothing.

Run `npm run lint:ts`, `npm run build`, and `npx vitest run` before opening a PR.

## Conventions

- Keep pure fill logic free of React and UI state so non-UI code can import it.
- Follow the surrounding code's naming, comment density, and import order. ESLint enforces the rest.

## Application filling

Application filling (interactive form answers, directives, autofill, PDF fill and save, and the case-selector handoff to a form) has an end-to-end fill matrix in `keepid_server_next` under `e2e/fill-matrix`. Run its `fill-check` before and after changing fill logic, and attach the report diff to the PR.

`buildWizardSubmitPayload` (`src/components/InteractiveForms/InteractiveFormWizard.tsx`) and `submitWizardFill` (`src/components/Applications/submitWizardFill.ts`) are imported by that check. Keep them pure: no React hooks, no UI state, no browser-only globals.
