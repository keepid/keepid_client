# Agent guide: keepid_client

## Application filling

Changes to how applications are filled (interactive form answers, directives,
autofill, the PDF fill and save path, selector-to-form handoff) must be checked
with the fill matrix before and after the change:

```bash
KEEPID_SERVER_DIR=<path to a keepid_server_next checkout> npm run fill-check
```

Attach the diff of `e2e/fill-matrix/out/report.md` to the PR. Findings that are
expected to stay open are listed in `e2e/fill-matrix/baseline.json`; update it only
when a finding is fixed or intentionally accepted. See `e2e/fill-matrix/README.md`
for the precedence spec, the rules, and how to read the report.
