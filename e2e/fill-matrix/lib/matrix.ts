/*
 * Trials run one after another on purpose: they share one database and reset the same fixture rows
 * before each run, so the loops below are sequential and are not a lint problem here.
 */
/* eslint-disable no-await-in-loop, no-restricted-syntax, no-continue */
import {
  type GetQuestionsV2Response,
  fillPdfBlob,
  getInteractiveFormConfig,
  getQuestionsV2,
} from '../../../src/components/Applications/api/interactiveForm';
import { createClassifiedService, loadCaseSelector, resolveCaseOutcome } from '../../../src/components/Applications/applicationSelector/flowApi';
import type { SelectorFlow, SelectorOutcomeSummary, SelectorPathStep } from '../../../src/components/Applications/applicationSelector/types';
import { submitWizardFill } from '../../../src/components/Applications/submitWizardFill';
import { buildWizardSubmitPayload } from '../../../src/components/InteractiveForms/InteractiveFormWizard';
import {
  buildInitialData,
  normalizeTextFieldValues,
} from '../../../src/components/InteractiveForms/useInteractiveForm';
import { resolveDirectiveFromProfilesForTarget } from '../../../src/utils/directives';
import { type DbCommand, type FixtureUserSnapshot, readStoredAnswers, restoreFixtureUsers, snapshotFixtureUsers } from './db';
import {
  type AutoFillField,
  type Expectation,
  type FormQuestions,
  buildAnswers,
  buildExpectations,
  collectDirectives,
  collectQuestions,
  directiveValue,
  matches,
} from './expectations';
import { type PdfReadback, readPdfFields } from './pdfRead';
import { getJson, installServerFetch, postJson } from './serverFetch';

export const FIXTURE_CLIENTS = [
  'fixture-empty',
  'fixture-full',
  'fixture-migrated-dob',
  'fixture-null-name-parts',
  'fixture-stale-phone',
];

export type RuleId = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6';

export const RULES: Record<RuleId, string> = {
  R0: 'form-loads: the published form config and questions load',
  R1: 'answer-reaches-pdf: every answered question reaches each PDF field it maps to',
  R2: 'profile-fallback: untouched pre-fill and hidden autofill fields hold profile or directive values',
  R3: 'directive-resolves: every directive a form uses resolves for fixture-full',
  R4: 'answers-save-back: writable directives land in the profile, and direct saves persist answers',
  R5: 'route-parity: picker WEB_FORM and direct produce the same PDF values and stored answers',
  R6: 'selector-coverage: every published outcome resolves and materializes',
};

export interface Finding {
  key: string;
  rule: RuleId;
  form: string;
  fixture: string;
  route: string;
  subject: string;
  message: string;
}

export interface FieldRow {
  pdfField: string;
  question: string;
  source: string;
  expected: string;
  actual: string;
  ok: boolean;
}

export interface FormReport {
  form: string;
  formId: string;
  fixtures: string[];
  fieldRows: Record<string, FieldRow[]>;
  notes: string[];
}

export interface MatrixOptions {
  baseUrl: string;
  db: DbCommand | null;
  log: (message: string) => void;
  /** Notes from setup, such as agency assets that could not be provisioned. */
  setupNotes?: string[];
}

export interface MatrixResult {
  findings: Finding[];
  forms: FormReport[];
  checks: Record<RuleId, number>;
  notes: string[];
  startedAt: string;
  finishedAt: string;
}

interface FormEntry {
  id: string;
  title: string;
  uiSchema: Record<string, unknown>;
  jsonSchema: Record<string, unknown>;
  builderState: Record<string, unknown>;
  questions: FormQuestions;
  autoFill: AutoFillField[];
  outputFields: unknown;
}

interface TrialOutcome {
  pdf: Record<string, string>;
  readback: PdfReadback;
  persistedId: string | null;
  payload: ReturnType<typeof buildWizardSubmitPayload>;
  profiles: GetQuestionsV2Response['resolvedProfiles'] | null;
  registryEntryId: string;
}

const INFORMATION_COMPONENTS = new Set([
  'information',
  'homelessness-definition',
  'penndot-login-details',
  'photo-id-upload',
]);

const compactJson = (value: unknown) => JSON.stringify(value);

/** Where a non-matching PDF value came from, for the report's source column. */
function classifyActual(actual: string | undefined, prefillValue: string | undefined): string {
  if (actual === undefined || actual === '') return 'blank';
  if (prefillValue !== undefined && actual === prefillValue) return 'profile';
  return 'other';
}

function short(value: unknown, max = 80): string {
  const text = typeof value === 'string' ? value : compactJson(value) ?? String(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function runMatrix(options: MatrixOptions): Promise<MatrixResult> {
  const { db, log } = options;
  const startedAt = new Date().toISOString();
  installServerFetch(options.baseUrl);
  const findings: Finding[] = [];
  const checks: Record<RuleId, number> = { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0 };
  const notes: string[] = [...(options.setupNotes ?? [])];
  const formReports: FormReport[] = [];
  const seenKeys = new Set<string>();

  const report = (rule: RuleId, form: string, fixture: string, route: string, subject: string, message: string) => {
    const key = [rule, form, fixture, route, subject].join('|');
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    findings.push({ key, rule, form, fixture, route, subject, message });
  };

  if (db === null) {
    notes.push('No database command: fixture rows are not reset between trials and stored-answer checks are skipped.');
  }

  const login = await postJson<{ status?: string }>('/login', { username: 'demo-worker', password: 'demo-pass' });
  if (login.status !== 'AUTH_SUCCESS') throw new Error(`demo-worker login failed: ${compactJson(login)}`);

  let fixtureSnapshot: FixtureUserSnapshot | null = null;
  if (db) fixtureSnapshot = snapshotFixtureUsers(db);
  const resetFixtures = () => {
    if (db && fixtureSnapshot) restoreFixtureUsers(db, fixtureSnapshot);
  };

  // Forms, discovered the way the client does: published options, then the registry lookup.
  const options0 = await getJson<Array<{ applicationId: string; label: string }>>('/get-available-application-options');
  const forms: Array<{ id: string; title: string }> = [];
  for (const option of options0) {
    const registry = await postJson<{ blankFormId?: string; message?: string }>('/get-application-registry', { applicationId: option.applicationId });
    if (registry.blankFormId) forms.push({ id: registry.blankFormId, title: option.label });
    else notes.push(`Option ${option.label} (${option.applicationId}) has no blankFormId: ${registry.message ?? 'unknown'}`);
  }
  forms.sort((a, b) => a.title.localeCompare(b.title));

  const formCache = new Map<string, FormEntry | null>();
  const loadForm = async (id: string, title: string): Promise<FormEntry | null> => {
    if (formCache.has(id)) return formCache.get(id) ?? null;
    try {
      const cfg = await getInteractiveFormConfig(id);
      const uiSchema = cfg.uiSchema as Record<string, unknown>;
      const builderState = (cfg.builderState ?? {}) as Record<string, unknown>;
      const autoFill = (builderState.autoFillFields ?? []) as AutoFillField[];
      const entry: FormEntry = {
        id,
        title,
        uiSchema,
        jsonSchema: cfg.jsonSchema as Record<string, unknown>,
        builderState,
        questions: collectQuestions(uiSchema),
        autoFill,
        outputFields: builderState.outputFields,
      };
      checks.R0 += 1;
      formCache.set(id, entry);
      return entry;
    } catch (error) {
      checks.R0 += 1;
      report('R0', title, '-', 'direct', 'config', `form config failed to load: ${(error as Error).message}`);
      formCache.set(id, null);
      return null;
    }
  };

  // Filling one trial: the same steps the wizard runs for the given answers.
  const fillTrial = async (
    form: FormEntry,
    fixture: string,
    values: Record<string, unknown>,
    mode: 'answers' | 'prefill',
    route: 'direct' | 'picker',
    selector?: { publishToken: string; path: SelectorPathStep[]; responses: Record<string, string>; registryEntryId: string; outcome: SelectorOutcomeSummary },
  ): Promise<{ outcome: TrialOutcome; expectations: Expectation[] }> => {
    const questions = await getQuestionsV2(form.id, fixture);
    const profiles = questions.resolvedProfiles ?? null;
    const data = mode === 'answers'
      ? normalizeTextFieldValues({ ...normalizeTextFieldValues(buildInitialData(form.uiSchema, profiles), form.jsonSchema), ...values }, form.jsonSchema)
      : normalizeTextFieldValues(values, form.jsonSchema);
    const payload = buildWizardSubmitPayload({
      uiSchema: form.uiSchema,
      jsonSchema: form.jsonSchema,
      data,
      resolvedProfiles: profiles,
      autoFillFields: form.autoFill,
      outputFields: form.outputFields as never,
    });
    let persistedId: string | null = null;
    let blob: Blob;
    let registryEntryId = form.id;
    if (mode === 'prefill') {
      blob = await fillPdfBlob(form.id, payload.pdfFill, fixture);
    } else {
      const completion = selector
        ? {
          publishToken: selector.publishToken,
          path: selector.path,
          responses: selector.responses,
          idempotencyKey: crypto.randomUUID(),
          confirmedEffectIds: [] as string[],
        }
        : undefined;
      if (selector && completion) {
        const resolved = await resolveCaseOutcome({
          clientUsername: fixture,
          publishToken: selector.publishToken,
          path: selector.path,
          responses: selector.responses,
        });
        completion.confirmedEffectIds = resolved.proposedActions.map((action) => action.effectId);
        registryEntryId = resolved.registryEntryId ?? selector.registryEntryId;
      }
      const saved = await submitWizardFill({
        blankFormId: registryEntryId,
        clientUsername: fixture,
        selectorCompletion: completion,
        pdfFill: payload.pdfFill,
        formOutput: payload.formOutput,
        profileUpdates: payload.profileUpdates,
        directiveValues: payload.directiveValues,
      });
      blob = saved.blob;
      persistedId = saved.persistedId;
    }
    const readback = await readPdfFields(await blob.arrayBuffer());
    const pdf = readback.values;
    const expectations = buildExpectations({
      questions: form.questions,
      jsonSchema: form.jsonSchema,
      profiles,
      mode,
      values: mode === 'answers' ? values : data,
      data,
      autoFillFields: form.autoFill,
    });
    return {
      outcome: { pdf, readback, persistedId, payload, profiles, registryEntryId },
      expectations,
    };
  };

  const checkExpectations = (
    expectations: Expectation[],
    readback: PdfReadback,
    form: string,
    fixture: string,
    route: string,
    rows: FieldRow[] | null,
    prefillPdf: Record<string, string> | null,
  ) => {
    const pdf = readback.values;
    for (const exp of expectations) {
      checks[exp.rule] += 1;
      const actual = pdf[exp.pdfField];
      const kind = readback.kinds[exp.pdfField];
      const exportValues = readback.options[exp.pdfField];
      let ok: boolean;
      let diagnosis = '';
      if (kind === 'checkbox' && exp.match !== 'token') {
        // A checked checkbox reads back as "On", so compare the checked state rather than the token.
        ok = ((actual ?? '') !== '') === (exp.token !== '' && exp.token.toLowerCase() !== 'off');
      } else if (exportValues && (exp.match === 'exact' || exp.match === 'checked') && exp.token !== '' && !exportValues.some((v) => v.toLowerCase() === exp.token.trim().toLowerCase())) {
        ok = false;
        diagnosis = ` (token "${short(exp.token, 40)}" is not an export value of this ${kind} field; its values are ${exportValues.map((v) => `"${v}"`).join(', ')})`;
      } else {
        ok = matches(actual, exp);
      }
      if (rows) {
        const source = ok ? exp.source : classifyActual(actual, prefillPdf?.[exp.pdfField]);
        rows.push({ pdfField: exp.pdfField, question: exp.question, source, expected: short(exp.token), actual: short(actual ?? '(field missing)'), ok });
      }
      if (ok) continue;
      const missing = actual === undefined ? ' (PDF has no field with this name)' : '';
      const sentence = exp.source === 'answer'
        ? `answered "${short(exp.token, 40)}" on "${exp.question}" but the PDF has "${short(actual ?? '', 60)}"${missing}${diagnosis}`
        : `${exp.source} for "${exp.question}" expected "${short(exp.token, 40)}" but the PDF has "${short(actual ?? '', 60)}"${missing}${diagnosis}`;
      report(exp.rule, form, fixture, route, exp.subject, sentence);
    }
  };

  const checkProfileSaveBack = async (form: FormEntry, fixture: string, route: string, payload: TrialOutcome['payload']) => {
    // Only client profile paths are writable. Computed ($-prefixed) directives and org, worker and
    // director values are not profile fields, so they are not expected to persist.
    const writable = Object.entries(payload.profileUpdates).filter(([key]) => key.startsWith('client.') && !key.includes('$'));
    if (writable.length === 0) return;
    const after = await getQuestionsV2(form.id, fixture);
    for (const [key, typed] of writable) {
      checks.R4 += 1;
      const resolved = directiveValue(after.resolvedProfiles ?? null, key, key);
      const ok = matches(resolved, {
        rule: 'R4', pdfField: key, subject: key, question: key, source: 'answer', match: 'loose', token: String(typed),
      });
      if (!ok) {
        report('R4', form.title, fixture, route, `directive:${key}`, `typed "${short(typed, 40)}" did not persist; profile resolves to "${short(resolved, 40)}"`);
      }
    }
  };

  // Results from the direct route, kept for the picker-route parity check.
  const directResults = new Map<string, { pdf: Record<string, string>; stored: Record<string, unknown> | null }>();

  for (const form of forms) {
    const entry = await loadForm(form.id, form.title);
    if (!entry) continue;
    const perFixtureRows: Record<string, FieldRow[]> = {};
    const formReport: FormReport = { form: form.title, formId: form.id, fixtures: [], fieldRows: perFixtureRows, notes: [] };
    formReports.push(formReport);

    for (const fixture of FIXTURE_CLIENTS) {
      formReport.fixtures.push(fixture);
      resetFixtures();
      const profileQuestions = await getQuestionsV2(form.id, fixture);
      const profiles = profileQuestions.resolvedProfiles ?? null;

      if (fixture === 'fixture-full') {
        const seen = new Set<string>();
        for (const found of collectDirectives(entry.questions, entry.autoFill)) {
          if (seen.has(found.directive)) continue;
          seen.add(found.directive);
          checks.R3 += 1;
          const raw = profiles ? resolveDirectiveFromProfilesForTarget(found.directive, profiles, found.target) : undefined;
          if (raw === undefined || raw === null) {
            report('R3', form.title, fixture, '-', `directive:${found.directive}`, `directive "${found.directive}" does not resolve against the client profile (used by ${found.used})`);
          } else if (raw === '') {
            report('R3', form.title, fixture, '-', `directive:${found.directive}`, `fixture-full has no value for "${found.directive}" (used by ${found.used}); fixture gap, not a directive gap`);
          }
        }
      }

      // Untouched pre-fill (no save): profile values must reach the PDF.
      const prefill = normalizeTextFieldValues(buildInitialData(entry.uiSchema, profiles), entry.jsonSchema);
      const prefillTrial = await fillTrial(entry, fixture, prefill, 'prefill', 'direct');
      const prefillPdf = prefillTrial.outcome.pdf;
      checkExpectations(prefillTrial.expectations, prefillTrial.outcome.readback, form.title, fixture, 'direct', null, null);

      // Direct route: answer every question, submit, and read back.
      resetFixtures();
      const answers = buildAnswers(entry.questions, entry.jsonSchema);
      const rows: FieldRow[] = [];
      const direct = await fillTrial(entry, fixture, answers, 'answers', 'direct');
      checkExpectations(direct.expectations, direct.outcome.readback, form.title, fixture, 'direct', rows, prefillPdf);
      perFixtureRows[fixture] = rows;
      const stored = db && direct.outcome.persistedId ? readStoredAnswers(db, direct.outcome.persistedId) : null;
      if (db) {
        checks.R4 += 1;
        const missing = Object.keys(direct.outcome.payload.pdfFill).filter((k) => {
          const v = stored?.[k];
          return v === undefined || String(v) !== String(direct.outcome.payload.pdfFill[k]);
        });
        if (missing.length > 0) {
          report('R4', form.title, fixture, 'direct', 'answers', `${missing.length} answered PDF field(s) not stored in application.answers, e.g. ${missing.slice(0, 5).join(', ')}`);
        }
      }
      await checkProfileSaveBack(entry, fixture, 'direct', direct.outcome.payload);
      directResults.set(`${form.id}|${fixture}`, { pdf: direct.outcome.pdf, stored });
    }
  }

  // Picker route: walk each WEB_FORM outcome to its registry entry and save from the selector.
  let selector: SelectorFlow | null = null;
  try {
    selector = await loadCaseSelector();
  } catch (error) {
    notes.push(`Case selector failed to load: ${(error as Error).message}`);
  }
  if (selector) {
    const flow = selector;
    const pathCache = new Map<string, { path: SelectorPathStep[]; responses: Record<string, string> } | null>();
    const pathFor = (outcome: SelectorOutcomeSummary) => {
      if (!pathCache.has(outcome.id)) pathCache.set(outcome.id, findPath(flow, outcome));
      return pathCache.get(outcome.id) ?? null;
    };

    // R6: every outcome resolves and materializes, checked for fixture-full.
    resetFixtures();
    for (const outcome of flow.outcomes) {
      const label = outcome.code || outcome.displayName;
      const walk = pathFor(outcome);
      checks.R6 += 1;
      if (!walk) {
        report('R6', 'selector', 'fixture-full', 'selector', `outcome:${label}`, `outcome "${label}" is not reachable from the root`);
        continue;
      }
      try {
        const resolved = await resolveCaseOutcome({
          clientUsername: 'fixture-full', publishToken: flow.publishToken, path: walk.path, responses: walk.responses,
        });
        const created = await createClassifiedService({
          clientUsername: 'fixture-full',
          publishToken: flow.publishToken,
          path: walk.path,
          responses: walk.responses,
          idempotencyKey: crypto.randomUUID(),
          confirmedEffectIds: resolved.proposedActions.map((a) => a.effectId),
        });
        if (!created.applicationId || created.classificationStatus === 'MANUAL_UNCLASSIFIED') {
          report('R6', 'selector', 'fixture-full', 'selector', `outcome:${label}`, `outcome "${label}" did not classify (status ${created.classificationStatus ?? 'none'})`);
        }
      } catch (error) {
        const message = (error as Error).message;
        // Document generation needs LibreOffice. A machine without it is an environment gap, not a finding.
        if (/libreoffice|soffice/i.test(message)) {
          notes.push(`outcome "${label}" not materialized: document conversion needs LibreOffice, which is not installed here`);
        } else {
          report('R6', 'selector', 'fixture-full', 'selector', `outcome:${label}`, `outcome "${label}" failed: ${message.slice(0, 160)}`);
        }
      }
    }

    // R1/R2/R4/R5 for picker WEB_FORM outcomes, once per fixture.
    const webOutcomes = flow.outcomes.filter((o) => o.fulfillmentMode === 'WEB_FORM' && o.registryEntryId);
    for (const outcome of webOutcomes) {
      const walk = pathFor(outcome);
      if (!walk || !outcome.registryEntryId) continue;
      const formTitle = forms.find((f) => f.id === outcome.registryEntryId)?.title ?? outcome.title ?? outcome.code;
      const entry = await loadForm(outcome.registryEntryId, formTitle);
      if (!entry) continue;
      for (const fixture of FIXTURE_CLIENTS) {
        resetFixtures();
        const answers = buildAnswers(entry.questions, entry.jsonSchema);
        const prefillQ = await getQuestionsV2(entry.id, fixture);
        const prefill = normalizeTextFieldValues(buildInitialData(entry.uiSchema, prefillQ.resolvedProfiles ?? null), entry.jsonSchema);
        const prefillTrial = await fillTrial(entry, fixture, prefill, 'prefill', 'direct');
        resetFixtures();
        const rows: FieldRow[] = [];
        try {
          const picked = await fillTrial(entry, fixture, answers, 'answers', 'picker', {
            publishToken: flow.publishToken,
            path: walk.path,
            responses: walk.responses,
            registryEntryId: outcome.registryEntryId,
            outcome,
          });
          checkExpectations(picked.expectations, picked.outcome.readback, entry.title, fixture, 'picker', rows, prefillTrial.outcome.pdf);
          const stored = db && picked.outcome.persistedId ? readStoredAnswers(db, picked.outcome.persistedId) : null;
          await checkProfileSaveBack(entry, fixture, 'picker', picked.outcome.payload);

          const directResult = directResults.get(`${entry.id}|${fixture}`);
          if (directResult) {
            checks.R5 += 1;
            const fields = new Set([...Object.keys(directResult.pdf), ...Object.keys(picked.outcome.pdf)]);
            for (const field of fields) {
              const a = directResult.pdf[field] ?? '';
              const b = picked.outcome.pdf[field] ?? '';
              if (a.trim().toLowerCase() !== b.trim().toLowerCase()) {
                report('R5', entry.title, fixture, 'picker', `pdf:${field}`, `picker PDF "${short(b, 50)}" differs from direct "${short(a, 50)}"`);
              }
            }
            if (db && directResult.stored) {
              const differing = Object.keys(directResult.stored).filter((k) => String(stored?.[k] ?? '') !== String(directResult.stored?.[k] ?? ''));
              if (differing.length > 0) {
                report('R5', entry.title, fixture, 'picker', 'stored-answers', `picker application.answers differs from direct for ${differing.length} field(s), e.g. ${differing.slice(0, 5).join(', ')}`);
              }
            }
          }
        } catch (error) {
          report('R5', entry.title, fixture, 'picker', 'save', `picker save failed: ${(error as Error).message.slice(0, 200)}`);
        }
        const existing = formReports.find((f) => f.formId === entry.id);
        if (existing) existing.fieldRows[`picker:${fixture}`] = rows;
      }
    }
  }

  const finishedAt = new Date().toISOString();
  findings.sort((a, b) => a.key.localeCompare(b.key));
  return { findings, forms: formReports, checks, notes, startedAt, finishedAt };
}

/** Breadth-first walk from the selector root to the outcome node, with the transition keys to take. */
export function findPath(
  flow: SelectorFlow,
  outcome: SelectorOutcomeSummary,
): { path: SelectorPathStep[]; responses: Record<string, string> } | null {
  const nodes = new Map(flow.nodes.map((n) => [n.id, n]));
  const target = flow.nodes.find((n) => n.type === 'OUTCOME' && n.outcomeId === outcome.id);
  if (!target) return null;
  const queue: Array<{ nodeId: string; path: SelectorPathStep[] }> = [{ nodeId: flow.rootNodeId, path: [] }];
  const seen = new Set<string>([flow.rootNodeId]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.nodeId === target.id) {
      const responses: Record<string, string> = {};
      current.path.forEach((step) => {
        const node = nodes.get(step.nodeId);
        if (node?.responseKey && !INFORMATION_COMPONENTS.has(node.componentKey ?? '')) {
          responses[node.responseKey] = node.componentKey === 'penndot-number' ? '12345678' : 'Qx0Zz';
        }
      });
      return { path: current.path, responses };
    }
    const node = nodes.get(current.nodeId);
    if (!node) continue;
    for (const transition of node.transitions) {
      if (seen.has(transition.childNodeId)) continue;
      seen.add(transition.childNodeId);
      queue.push({
        nodeId: transition.childNodeId,
        path: [...current.path, { nodeId: node.id, transitionKey: transition.key }],
      });
    }
  }
  return null;
}
