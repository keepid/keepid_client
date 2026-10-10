import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { type Finding, type MatrixResult, type RuleId, FIXTURE_CLIENTS, RULES } from './matrix';

export interface BaselineFinding {
  key: string;
  rule: RuleId;
  form: string;
  fixture: string;
  route: string;
  subject: string;
  message: string;
}

export interface BaselineFile {
  schema: 1;
  findings: BaselineFinding[];
}

export interface BaselineDiff {
  added: Finding[];
  fixed: BaselineFinding[];
  kept: Finding[];
}

const RULE_ORDER = Object.keys(RULES) as RuleId[];

export function readBaseline(path: string): BaselineFile {
  if (!existsSync(path)) return { schema: 1, findings: [] };
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as BaselineFile;
  return { schema: 1, findings: parsed.findings ?? [] };
}

/** Stable, sorted JSON so a baseline update reads as a clean diff. */
export function writeBaseline(path: string, findings: Finding[]): void {
  const sorted = [...findings]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((f) => ({
      key: f.key,
      rule: f.rule,
      form: f.form,
      fixture: f.fixture,
      route: f.route,
      subject: f.subject,
      message: f.message,
    }));
  const body = { schema: 1, findings: sorted };
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`);
}

export function diffBaseline(current: Finding[], baseline: BaselineFile): BaselineDiff {
  const currentKeys = new Set(current.map((f) => f.key));
  const baselineKeys = new Set(baseline.findings.map((f) => f.key));
  return {
    added: current.filter((f) => !baselineKeys.has(f.key)),
    kept: current.filter((f) => baselineKeys.has(f.key)),
    fixed: baseline.findings.filter((f) => !currentKeys.has(f.key)),
  };
}

function countBy(findings: Array<{ rule: string }>): Record<string, number> {
  return findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.rule] = (acc[f.rule] ?? 0) + 1;
    return acc;
  }, {});
}

export function renderMarkdown(result: MatrixResult, diff: BaselineDiff, meta: { baseUrl: string; dbReset: boolean; runtimeSeconds: number }): string {
  const lines: string[] = [];
  const total = countBy(result.findings);
  const added = countBy(diff.added);
  const fixed = countBy(diff.fixed);
  const kept = countBy(diff.kept);

  lines.push('# Fill matrix report', '');
  lines.push(`Generated ${result.finishedAt} against \`${meta.baseUrl}\`. Runtime ${meta.runtimeSeconds}s. Fixture rows reset between trials: ${meta.dbReset ? 'yes' : 'no (no database command)'}.`, '');
  lines.push('## Summary', '');
  lines.push(`Findings: ${result.findings.length} total, ${diff.added.length} new, ${diff.kept.length} baselined, ${diff.fixed.length} fixed since the baseline.`, '');
  lines.push('| Rule | What it checks | Checks | Findings | New | Baselined | Fixed |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |');
  RULE_ORDER.forEach((rule) => {
    lines.push(`| ${rule} | ${RULES[rule].split(': ')[0]} | ${result.checks[rule]} | ${total[rule] ?? 0} | ${added[rule] ?? 0} | ${kept[rule] ?? 0} | ${fixed[rule] ?? 0} |`);
  });
  lines.push('');
  if (result.notes.length > 0) {
    lines.push('## Notes', '');
    result.notes.forEach((note) => lines.push(`- ${note}`));
    lines.push('');
  }

  lines.push('## Findings by rule', '');
  const newKeys = new Set(diff.added.map((f) => f.key));
  RULE_ORDER.filter((rule) => result.findings.some((f) => f.rule === rule)).forEach((rule) => {
    lines.push(`### ${rule} ${RULES[rule]}`, '');
    result.findings.filter((f) => f.rule === rule).forEach((f) => {
      const tag = newKeys.has(f.key) ? ' **(new)**' : '';
      lines.push(`- ${f.form} · ${f.fixture} · ${f.route} · \`${f.subject}\`${tag}: ${f.message}`);
    });
    lines.push('');
  });

  if (diff.fixed.length > 0) {
    lines.push('## Fixed since baseline', '', 'These baselined findings no longer occur. Update the baseline to lock in the fix.', '');
    diff.fixed.forEach((f) => lines.push(`- ${f.form} · ${f.fixture} · ${f.route} · \`${f.subject}\` (${f.rule})`));
    lines.push('');
  }

  lines.push('## Forms', '', 'Each row is one PDF field from the direct trial with a fixture-full answer. Source: `answer` (the typed sentinel), `literal` (fixed token), `directive` (hidden autofill), `profile` (pre-fill value), `blank`, or `other`.', '');
  result.forms.forEach((form) => {
    lines.push(`### ${form.form}`, '', `Form id \`${form.formId}\`.`, '');
    lines.push('| Fixture | Fields | answer | literal | directive | profile | blank | other | mismatches |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
    FIXTURE_CLIENTS.forEach((fixture) => {
      const rows = form.fieldRows[fixture] ?? [];
      const by = countBy(rows.map((r) => ({ rule: r.source })));
      const mismatches = rows.filter((r) => !r.ok).length;
      lines.push(`| ${fixture} | ${rows.length} | ${by.answer ?? 0} | ${by.literal ?? 0} | ${by.directive ?? 0} | ${by.profile ?? 0} | ${by.blank ?? 0} | ${by.other ?? 0} | ${mismatches} |`);
    });
    const full = form.fieldRows['fixture-full'] ?? [];
    if (full.length > 0) {
      lines.push('', '<details><summary>fixture-full direct fields</summary>', '');
      lines.push('| PDF field | Question | Source | Expected | Actual | OK |');
      lines.push('| --- | --- | --- | --- | --- | --- |');
      full.forEach((r) => lines.push(`| \`${r.pdfField}\` | ${r.question.replace(/\|/g, '/')} | ${r.source} | ${r.expected.replace(/\|/g, '/')} | ${r.actual.replace(/\|/g, '/')} | ${r.ok ? 'yes' : 'no'} |`));
      lines.push('', '</details>', '');
    }
  });
  return `${lines.join('\n')}\n`;
}

export function renderJson(result: MatrixResult, diff: BaselineDiff): string {
  return `${JSON.stringify({
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    checks: result.checks,
    notes: result.notes,
    summary: {
      findings: countBy(result.findings),
      added: countBy(diff.added),
      fixed: countBy(diff.fixed),
    },
    findings: result.findings,
    newFindingKeys: diff.added.map((f) => f.key),
    fixedFindingKeys: diff.fixed.map((f) => f.key),
    forms: result.forms,
  }, null, 2)}\n`;
}
