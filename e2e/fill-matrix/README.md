# Fill matrix

The fill matrix checks how Keep.id fills application PDFs. It runs every published form against
every fixture client through each route a worker can take, and compares the PDF and the saved
record with what the spec says should happen. It exists so that a change to application filling
can be checked against the real forms before it is merged.

It runs the client's own fill code. The harness imports `buildFormAnswers`, `buildInitialData`,
`buildWizardSubmitPayload`, `submitWizardFill` and the API and selector modules from `src/`, so a
change to those is what gets tested.

## Run it

```bash
npm run fill-check
```

This needs Docker and a checkout of `keepid_server_next` that has the config snapshot. Until the
snapshot merges to `main`, point at the snapshot worktree:

```bash
KEEPID_SERVER_DIR=/path/to/keepid_server_next/.worktrees/keepid_server_next/config-snapshot npm run fill-check
```

`fill-check` does the following:

1. Starts Postgres 17 on `127.0.0.1:55433` and fake-gcs on `127.0.0.1:4444` in Docker. These are
   separate containers from the usual dev stack. They are removed at the end, even on failure.
2. Starts the server with the `dev` profile on port `7301`. The config snapshot and the five
   fixture clients load at startup. The server log is in `out/server.log`.
3. Provisions the demo agency's EIN, website and three image assets, which the server's own
   integrity test also sets up. Templates need them, and they are not in the snapshot.
4. Runs the matrix and compares the findings with `baseline.json`.
5. Writes `out/report.md` and `out/report.json`, stops the server, and removes the containers.

Other environment variables:

| Variable | Purpose |
| --- | --- |
| `KEEPID_SERVER_DIR` | Server checkout to run. Default: `keepid_server_next` next to the workspace. |
| `FILL_CHECK_BASE_URL` | Use a server that is already running instead of starting one. |
| `FILL_CHECK_PSQL` | psql command for that server, for example `psql postgresql://keepid@127.0.0.1:5432/keepid`. Needed for resets and stored-answer checks. Without it, rows are not reset between trials and those checks are skipped. |
| `FILL_CHECK_GCS_URL` | fake-gcs base URL, to provision the agency image assets on a running server. |
| `FILL_CHECK_PG_PORT`, `FILL_CHECK_GCS_PORT`, `FILL_CHECK_SERVER_PORT` | Override the scratch ports (defaults 55433, 4444, 7301). |

Do not point `FILL_CHECK_PSQL` at production. The harness writes fixture rows and creates
applications. It does not read or write production.

## What it checks

The matrix runs each published form (discovered through `get-available-application-options`, as the
client does) for each fixture client:

- **Pre-fill trial (no save).** The wizard starts from the profile pre-fill, which the UI shows, and
  submits it untouched.
- **Direct trial.** Every question gets a unique sentinel answer (`Qx<n>Zz`, or a valid date, email,
  or enum value). The answers go through the wizard's real submit computation and are then saved
  with the same steps the form uses on save.
- **Picker trial.** For each `WEB_FORM` outcome in the case selector, the harness walks the path to
  the outcome, resolves it, and saves through the same selector completion the client uses.

| Rule | What it checks |
| --- | --- |
| R0 | Form config and questions load. |
| R1 | Every answered question reaches each PDF field it maps to: its own field, option mappings, conditional fills, and the second and later destinations on a grouped question. |
| R2 | Untouched pre-fill values reach the PDF (pre-fill trial). Hidden autofill fields, meaning those no question touches, hold their directive value (direct trial). |
| R3 | Every directive a form uses resolves against `fixture-full`. A directive with no value on that fixture is reported as a fixture gap. |
| R4 | Writable `client.*` directives are in the profile after save. The saved application stores the answers that went into the PDF. Computed `$` directives and org, worker and director values are not profile writes and are not checked. |
| R5 | The picker route produces the same PDF values and stored `application.answers` as the direct route for the same form and answers. |
| R6 | Every published selector outcome is reachable, resolves, and materializes into a classified service record (checked for `fixture-full`). |

Each finding has a key of the form `RULE|form|fixture|route|subject`. The baseline matches on the
key, so the message can improve without a baseline change.

## The precedence spec

A question's pre-fill comes from the profile. The PDF is filled from answers only, and the saved
profile takes the user's answer. The rule that governs conflicts:

> A directive fills a PDF field directly only when no question is attached to that field.

So when a user changes a pre-filled answer, the PDF and the saved profile get the user's value. An
attached field never takes a directive value, even when the directive resolves. Hidden autofill
(a PDF field no question touches) is the only place a directive fills a field directly.

The rules above encode this. Most current findings are violations of it.

## Reading the report

`out/report.md` starts with a summary table: for each rule, the number of checks, findings, new
findings, baselined findings and fixed findings. Then the findings grouped by rule, each with the
form, fixture, route, subject and a message. Last, one section per form, with a table per fixture
that counts each PDF field's source:

- `answer`: the typed sentinel reached the field.
- `literal`: a fixed token from the form config (for example an option's `fillValue`).
- `directive`: a hidden autofill value.
- `profile`: the pre-fill value reached the field (the answer was not used).
- `blank`: the field is empty.
- `other`: anything else.

The `fixture-full` table lists every field with its expected and actual value. Use it to see what the
PDF actually contains.

`out/report.json` has the same findings and the per-field rows for tooling.

## Updating the baseline

`baseline.json` lists the findings that are known and accepted for now. The check fails when:

- a finding is **new** (it is not in the baseline), or
- a baselined finding is **fixed** (it no longer occurs). The output says `fixed — update baseline`.

When a finding is fixed, update the baseline so the fix is locked in:

```bash
npm run fill-check -- --update-baseline
```

Only do that when the change is the one you intended. Review the diff of `baseline.json`. Entries
should only disappear, or be added with a reason in the PR description.

## For agents

To change anything in application filling, run `npm run fill-check` before and after the change.
Attach the diff of `out/report.md` (or the new and fixed lists from the console) to the PR. Do not
update the baseline to make a new finding pass. Fix the finding, or say in the PR why it is accepted.

## Limits

- Fixture gaps show up as R3 findings. `fixture-full` has an empty `mailAddress.line2` and no
  `motherName.suffix`, so those directives have nothing to fill.
- R2's untouched-value check covers direct-route pre-fill only. The picker route is covered for
  answers, parity and stored values.
- R6 and the picker trials create classified service records, and each run writes to the scratch
  database. They do not send SMS, mail or documents: the scratch server has no Twilio or Lob
  configured, and document generation needs LibreOffice, which this check does not require.
- Rows are restored from a snapshot before each trial, so findings do not depend on earlier trials.
  Without a database command this is not done, and the baseline will be less stable.
