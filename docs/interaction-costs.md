# Communications cost detail

A small gray Costs button appears beside the timestamp at the bottom-right of
each call card. Hover or focus on desktop; tap on mobile. Escape closes it.
The tooltip fetches the call's stored cost breakdown only when opened and
refreshes every 30 seconds while open. It never calls Twilio/OpenRouter directly.

Backend prerequisite: `GET /api/communications/calls/{callId}/costs` and the
server's V41 `interaction_cost` migration. Existing call/message DTOs do not
change. Deploy the backend first. Calls without historical data show unavailable,
not zero. Unreported rows show Pending; estimated charges and partial subtotals
are explicitly labeled. Currency totals remain separate; fractional cents are
shown to six decimal places in the UI (the database stores ten decimal places).

Backend technical notes and SQL examples live in
`keepid_server_next/docs/interaction-costs.md`.

Verification:

```sh
npx vitest run src/components/Communications/CallCosts.test.tsx src/components/Communications/CallTranscript.test.tsx
npx eslint src/components/Communications/CallCosts.tsx src/components/Communications/CallCosts.test.tsx src/components/Communications/CallsPage.tsx src/components/Communications/communicationsApi.ts
npm run build
```

Desktop (1280×720) and mobile (390×844) screenshots use synthetic call and cost
fixtures from `keepid_server_next/scripts/seed-interaction-cost-demo.sql`.
Both were checked against the running local backend; no production client data
or billed calls were used. For the default client setup, run the backend on
localhost:7001 and Vite on localhost:3000. This repository's serverOverride.ts
currently hardcodes the development backend port.
