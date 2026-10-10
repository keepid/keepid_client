/**
 * Answer sentinels and the expected PDF value for every answered question.
 *
 * Spec (Daniel's decision, encoded here):
 *   - Profile values pre-fill a question. The PDF is filled from answers only.
 *   - A directive fills a PDF field directly only when no question is attached to that field.
 *
 * So for each PDF field that a question maps to (its own pdfField, option mappings, conditional
 * fills, and the second and later destinations on a grouped question), the expected value is the
 * answer. Directive-only fields that no question touches are expected to hold the directive value.
 */
import type { GetQuestionsV2Response } from '../../../src/components/Applications/api/interactiveForm';
import { fillConditionMatches } from '../../../src/components/InteractiveForms/useInteractiveForm';
import { resolveDirectiveFromProfilesForTarget } from '../../../src/utils/directives';

type Options = Record<string, unknown>;
type Schema = Record<string, unknown>;
type Profiles = GetQuestionsV2Response['resolvedProfiles'] | null;

export type MatchKind = 'token' | 'exact' | 'loose' | 'checked';
export type ExpectSource = 'answer' | 'literal' | 'directive' | 'prefill';

export interface Expectation {
  rule: 'R1' | 'R2';
  pdfField: string;
  /** Subject used for finding keys: the PDF field, or "prefill:<field>" for untouched runs. */
  subject: string;
  question: string;
  source: ExpectSource;
  match: MatchKind;
  /** Expected token. For 'checked', a non-empty token means the box must be checked. */
  token: string;
}

export interface Leaf {
  prop: string;
  scope: string;
  label: string;
  options: Options;
  group: GroupCtx | null;
  index: number;
}

export interface GroupCtx {
  label: string;
  options: Options;
  leaves: Leaf[];
}

export interface FormQuestions {
  leaves: Leaf[];
  groups: GroupCtx[];
}

export interface AutoFillField {
  value?: string;
  valueSource?: string;
  pdfFieldName?: string;
  fieldType?: string;
}

const ON_PLACEHOLDER = 'On';

export function propFromScope(scope: string): string {
  return scope.replace('#/properties/', '').replace(/\//g, '.');
}

export function collectQuestions(uiSchema: Record<string, unknown>): FormQuestions {
  const leaves: Leaf[] = [];
  const groups: GroupCtx[] = [];
  const visit = (el: Record<string, unknown>, group: GroupCtx | null) => {
    if (el.type === 'Control') {
      const scope = el.scope as string | undefined;
      if (!scope) return;
      const leaf: Leaf = {
        prop: propFromScope(scope),
        scope,
        label: String(el.label ?? scope),
        options: (el.options ?? {}) as Options,
        group,
        index: leaves.length + 1,
      };
      leaves.push(leaf);
      group?.leaves.push(leaf);
      return;
    }
    if (el.type === 'Group') {
      const ctx: GroupCtx = { label: String(el.label ?? ''), options: (el.options ?? {}) as Options, leaves: [] };
      groups.push(ctx);
      (el.elements as Record<string, unknown>[] | undefined)?.forEach((child) => visit(child, ctx));
      return;
    }
    (el.elements as Record<string, unknown>[] | undefined)?.forEach((child) => visit(child, group));
  };
  visit(uiSchema, null);
  return { leaves, groups };
}

/** The answer a fill-matrix trial gives a question. Every question gets one. */
export function sentinelFor(schema: Schema | undefined, index: number): unknown {
  if (!schema) return `Qx${index}Zz`;
  if (schema.type === 'boolean') return true;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return String(schema.enum[0]);
  if (schema.type === 'number' || schema.type === 'integer') return 7;
  const format = String(schema.format ?? '').toLowerCase();
  if (format === 'date') return '2001-02-03';
  if (format === 'email') return `qx${index}zz@example.com`;
  if (format === 'uri' || format === 'url') return `https://example.com/qx${index}zz`;
  return `Qx${index}Zz`;
}

export function buildAnswers(questions: FormQuestions, jsonSchema: Schema): Record<string, unknown> {
  const properties = (jsonSchema.properties ?? {}) as Record<string, Schema>;
  const answers: Record<string, unknown> = {};
  questions.leaves.forEach((leaf) => {
    answers[leaf.prop] = sentinelFor(properties[leaf.prop], leaf.index);
  });
  return answers;
}

function mdy(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${m}/${d}/${y}`;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
}

/** The match and token a question value should produce on the PDF. */
function tokenFor(
  value: unknown,
  schema: Schema | undefined,
  mode: 'answers' | 'prefill',
): { match: MatchKind; token: string } {
  if (schema?.type === 'boolean' || typeof value === 'boolean') {
    return { match: 'checked', token: value === true || value === 'true' ? 'true' : '' };
  }
  if (isIsoDate(value)) return { match: 'loose', token: mdy(value) };
  if (Array.isArray(schema?.enum)) return { match: 'exact', token: String(value) };
  return { match: mode === 'prefill' ? 'loose' : 'token', token: String(value) };
}

function resolvedString(value: unknown): string {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function directiveValue(
  profiles: Profiles,
  directive: string,
  target: string,
): string {
  if (!profiles) return '';
  return resolvedString(resolveDirectiveFromProfilesForTarget(directive, profiles, target));
}

interface ExpectContext {
  questions: FormQuestions;
  jsonSchema: Schema;
  profiles: Profiles;
  mode: 'answers' | 'prefill';
  values: Record<string, unknown>;
  data: Record<string, unknown>;
  autoFillFields: AutoFillField[];
}

/**
 * Expected PDF values for one trial.
 * mode 'answers': the trial answered every question (R1 for question-attached fields, R2 for hidden autofill).
 * mode 'prefill': the trial submitted the profile pre-fill untouched (R2 for question-attached fields).
 */
export function buildExpectations(input: Omit<ExpectContext, 'data'> & { data?: Record<string, unknown> }): Expectation[] {
  const ctx: ExpectContext = { ...input, data: input.data ?? input.values };
  const { leaves, groups } = ctx.questions;
  const properties = (ctx.jsonSchema.properties ?? {}) as Record<string, Schema>;
  const rule = ctx.mode === 'answers' ? 'R1' : 'R2';
  const out: Expectation[] = [];

  // Every PDF field a question maps to, whether or not a value is present for it.
  const questionFields = new Set<string>();
  leaves.forEach((leaf) => {
    const o = leaf.options;
    if (typeof o.pdfField === 'string' && o.pdfField) questionFields.add(o.pdfField);
    (o.optionMappings as Array<Record<string, unknown>> | undefined)?.forEach((m) => {
      if (typeof m.pdfField === 'string') questionFields.add(m.pdfField);
    });
    (o.conditionalFills as Array<Record<string, unknown>> | undefined)?.forEach((cf) => {
      if (typeof cf.pdfField === 'string') questionFields.add(cf.pdfField);
    });
  });
  groups.forEach((g) => {
    (g.options.conditionalFills as Array<Record<string, unknown>> | undefined)?.forEach((cf) => {
      if (typeof cf.pdfField === 'string') questionFields.add(cf.pdfField);
    });
  });

  const push = (pdfField: string, question: string, source: ExpectSource, match: MatchKind, token: string) => {
    if (!pdfField) return;
    if (token === '' && match !== 'checked') return;
    const subject = ctx.mode === 'answers' ? pdfField : `prefill:${pdfField}`;
    out.push({
      rule: source === 'directive' ? 'R2' : rule,
      pdfField,
      subject,
      question,
      source,
      match,
      token,
    });
  };

  const answerSource: ExpectSource = ctx.mode === 'answers' ? 'answer' : 'prefill';

  // Control-level destinations.
  leaves.forEach((leaf) => {
    const value = ctx.values[leaf.prop];
    if (value === undefined || value === null || value === '') return;
    const schema = properties[leaf.prop];
    const o = leaf.options;
    const label = leaf.label;
    const answered = tokenFor(value, schema, ctx.mode);

    // Own destination. An explicit fillValue is a fixed token and overrides the answer.
    // A boolean question is a checkbox: it is checked when the answer is true.
    const hasFill = o.fillValue !== undefined && o.fillValue !== null && o.fillValue !== '';
    if (typeof o.pdfField === 'string' && o.pdfField) {
      if (answered.match === 'checked') {
        const checkedToken = hasFill ? String(o.fillValue) : 'true';
        push(o.pdfField, label, hasFill ? 'literal' : answerSource, 'checked', answered.token !== '' ? checkedToken : '');
      } else if (hasFill) {
        push(o.pdfField, label, 'literal', 'exact', String(o.fillValue));
      } else {
        push(o.pdfField, label, answerSource, answered.match, answered.token);
      }
    }

    // Option mappings for the selected option.
    const mappings = (o.optionMappings as Array<Record<string, unknown>> | undefined) ?? [];
    const countByField = mappings.reduce<Record<string, number>>((acc, m) => {
      const key = String(m.pdfField ?? '');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    mappings.forEach((m) => {
      const pdfField = typeof m.pdfField === 'string' ? m.pdfField : '';
      if (!pdfField || String(m.forOption) !== String(value)) return;
      const explicit = m.fillValue;
      const shared = (countByField[pdfField] ?? 0) > 1;
      if (explicit !== undefined && explicit !== null && explicit !== '') {
        if (explicit === ON_PLACEHOLDER) return;
        push(pdfField, label, 'literal', 'exact', String(explicit));
        return;
      }
      if (shared) return; // Shared group targets need an explicit token; the code never guesses one.
      push(pdfField, label, answerSource, 'exact', String(m.forOption));
    });

    // Control-level conditional fills.
    const conditionalFills = (o.conditionalFills as Array<Record<string, unknown>> | undefined) ?? [];
    conditionalFills.forEach((cf) => {
      if (typeof cf.pdfField !== 'string') return;
      if (!fillConditionMatches(cf.fillCondition as never, ctx.data)) return;
      if (cf.fillValue !== undefined && cf.fillValue !== null && cf.fillValue !== '') {
        push(cf.pdfField, label, 'literal', 'exact', String(cf.fillValue));
      } else {
        push(cf.pdfField, label, answerSource, answered.match, answered.token);
      }
    });
  });

  // Group-level conditional fills. A fill with a directive is the second or later destination of a
  // sibling question, so it takes that sibling's answer. With no sibling it stays directive-driven.
  groups.forEach((g) => {
    const conditionalFills = (g.options.conditionalFills as Array<Record<string, unknown>> | undefined) ?? [];
    conditionalFills.forEach((cf) => {
      if (typeof cf.pdfField !== 'string') return;
      if (!fillConditionMatches(cf.fillCondition as never, ctx.data)) return;
      if (cf.fillValue !== undefined && cf.fillValue !== null && cf.fillValue !== '') {
        push(cf.pdfField, g.label, 'literal', 'exact', String(cf.fillValue));
        return;
      }
      const directive = typeof cf.directive === 'string' ? cf.directive : '';
      const sibling = directive ? g.leaves.find((l) => l.options.directive === directive) : undefined;
      if (sibling) {
        const siblingValue = ctx.values[sibling.prop];
        if (siblingValue === undefined || siblingValue === null || siblingValue === '') return;
        const t = tokenFor(siblingValue, properties[sibling.prop], ctx.mode);
        push(cf.pdfField, g.label, answerSource, t.match, t.token);
        return;
      }
      if (directive) {
        const resolved = directiveValue(ctx.profiles, directive, `${g.label} ${cf.pdfField}`);
        if (resolved) push(cf.pdfField, g.label, 'directive', 'loose', resolved);
        return;
      }
      const first = g.leaves[0];
      const baseValue = first ? ctx.values[first.prop] : undefined;
      if (first && baseValue !== undefined && baseValue !== null && baseValue !== '') {
        const t = tokenFor(baseValue, properties[first.prop], ctx.mode);
        push(cf.pdfField, g.label, answerSource, t.match, t.token);
      }
    });
  });

  // Hidden autofill: directive or literal fields that no question touches. Answers mode only.
  if (ctx.mode === 'answers') {
    ctx.autoFillFields.forEach((af) => {
      const pdfField = af.pdfFieldName;
      if (!pdfField || questionFields.has(pdfField)) return;
      if (af.fieldType === 'checkbox') {
        const token = typeof af.value === 'string' && af.value.trim() !== '' ? af.value : 'true';
        out.push({ rule: 'R2', pdfField, subject: pdfField, question: 'hidden autofill', source: 'directive', match: 'checked', token });
        return;
      }
      if (af.valueSource === 'directive' && af.value) {
        const resolved = directiveValue(ctx.profiles, af.value, pdfField);
        if (resolved) {
          out.push({ rule: 'R2', pdfField, subject: pdfField, question: 'hidden autofill', source: 'directive', match: 'loose', token: resolved });
        }
        return;
      }
      if (af.valueSource === 'literal' && af.value) {
        out.push({ rule: 'R2', pdfField, subject: pdfField, question: 'hidden autofill', source: 'literal', match: 'exact', token: af.value });
      }
    });
  }

  return out;
}

export function canonical(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

function digitsOf(text: string): string {
  return text.replace(/\D/g, '');
}

/** Whether an actual PDF value (readback) satisfies an expectation. */
export function matches(actual: string | undefined, exp: Expectation): boolean {
  const a = (actual ?? '').trim();
  switch (exp.match) {
    case 'checked':
      return (a !== '') === (exp.token !== '');
    case 'token':
      return a.toLowerCase().includes(exp.token.toLowerCase());
    case 'exact':
      return a.toLowerCase() === exp.token.trim().toLowerCase();
    case 'loose': {
      if (canonical(a) === canonical(exp.token)) return true;
      const da = digitsOf(a).split('').sort().join('');
      const dt = digitsOf(exp.token).split('').sort().join('');
      return da.length >= 6 && da === dt;
    }
    default:
      return false;
  }
}

/** Directives a form references, with the field each one is used on (for R3). */
export function collectDirectives(
  questions: FormQuestions,
  autoFillFields: AutoFillField[],
): Array<{ directive: string; target: string; used: string }> {
  const found: Array<{ directive: string; target: string; used: string }> = [];
  const add = (directive: unknown, target: string, used: string) => {
    if (typeof directive === 'string' && directive.trim()) {
      found.push({ directive: directive.trim(), target, used });
    } else if (Array.isArray(directive)) {
      directive.forEach((entry) => {
        const use = (entry as { use?: unknown }).use;
        if (typeof use === 'string' && use.trim()) found.push({ directive: use.trim(), target, used });
      });
    }
  };
  questions.leaves.forEach((leaf) => {
    const o = leaf.options;
    const used = leaf.label;
    add(o.directive, `${leaf.label} ${String(o.pdfField ?? '')}`, used);
    (o.optionMappings as Array<Record<string, unknown>> | undefined)?.forEach((m) => add(m.directive, `${leaf.label} ${String(m.pdfField ?? '')}`, used));
    (o.conditionalFills as Array<Record<string, unknown>> | undefined)?.forEach((cf) => add(cf.directive, `${leaf.label} ${String(cf.pdfField ?? '')}`, used));
  });
  questions.groups.forEach((g) => {
    (g.options.conditionalFills as Array<Record<string, unknown>> | undefined)?.forEach((cf) => add(cf.directive, `${g.label} ${String(cf.pdfField ?? '')}`, g.label));
  });
  autoFillFields.forEach((af) => {
    if (af.valueSource === 'directive' && af.value) add(af.value, af.pdfFieldName ?? '', `hidden autofill ${af.pdfFieldName ?? ''}`);
  });
  return found;
}
