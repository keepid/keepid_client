/** Types shared with FormBuilder (dev portal). Used by InteractiveFormWizard. */

import type { ResolvedProfiles } from '../../utils/directives';
import { resolveDirectiveFromProfiles } from '../../utils/directives';

export type OutputValueSource = 'literal' | 'formField' | 'pdfField' | 'directive';

export interface OutputFieldCondition {
  questionId: string;
  operator: string;
  value: string;
}

export interface OutputFieldRule {
  conditions: OutputFieldCondition[];
  combine: 'and' | 'or';
  setValue: string | null;
  valueSource?: OutputValueSource;
  questionId?: string;
  pdfFieldId?: string;
  directive?: string;
}

export interface OutputFieldDefinition {
  key: string;
  defaultValue?: string | null;
  defaultValueSource?: OutputValueSource;
  defaultQuestionId?: string;
  defaultPdfFieldId?: string;
  defaultDirective?: string;
  rules: OutputFieldRule[];
}

export interface SignaturePlacement {
  page: number;
  rect: [number, number, number, number];
  label?: string;
}

export interface AutoFillField {
  pdfFieldName: string;
  valueSource: 'literal' | 'directive';
  value: string;
  fieldType?: 'text' | 'checkbox';
}

export interface BuilderState {
  steps: unknown[];
  outputFields?: OutputFieldDefinition[];
  autoFillFields?: AutoFillField[];
  signaturePlacements?: SignaturePlacement[];
}

export type { ResolvedProfiles };

export interface ComputeMetadataOptions {
  pdfFill?: Record<string, unknown>;
  resolvedProfiles?: ResolvedProfiles | null;
}

function parseCondValue(v: string): string | boolean {
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}

function singleConditionMatches(cond: OutputFieldCondition, data: Record<string, unknown>): boolean {
  const value = data[cond.questionId];
  switch (cond.operator) {
    case 'equals': {
      const want = parseCondValue(cond.value);
      return value === want;
    }
    case 'notEquals': {
      const wantNot = parseCondValue(cond.value);
      return value !== wantNot;
    }
    case 'checked': return value === true;
    case 'unchecked': return value === false;
    case 'notEmpty': return value != null && value !== '';
    case 'empty': return value == null || value === '';
    default: return value === cond.value;
  }
}

function getRuleConditions(rule: OutputFieldRule): OutputFieldCondition[] {
  if (rule.conditions != null && rule.conditions.length > 0) return rule.conditions;
  const legacy = rule as unknown as { questionId?: string; operator?: string; value?: string };
  if (legacy.questionId != null && legacy.questionId !== '') {
    return [{ questionId: legacy.questionId, operator: legacy.operator ?? 'equals', value: legacy.value ?? '' }];
  }
  return [];
}

function outputRuleMatches(rule: OutputFieldRule, data: Record<string, unknown>): boolean {
  const conditions = getRuleConditions(rule);
  if (conditions.length === 0) return false;
  const combine = rule.combine ?? 'and';
  if (combine === 'and') return conditions.every((c) => singleConditionMatches(c, data));
  return conditions.some((c) => singleConditionMatches(c, data));
}

function resolveOutputValue(
  source: OutputValueSource | undefined,
  config: {
    setValue?: string | null;
    defaultValue?: string | null;
    questionId?: string;
    pdfFieldId?: string;
    directive?: string;
    defaultQuestionId?: string;
    defaultPdfFieldId?: string;
    defaultDirective?: string;
  },
  data: Record<string, unknown>,
  options: ComputeMetadataOptions | undefined,
  useDefaultValue: boolean,
  resolveDirective: (d: string, p: ResolvedProfiles | null | undefined) => unknown = resolveDirectiveFromProfiles,
): unknown {
  const src = source ?? 'literal';
  const questionId = useDefaultValue ? config.defaultQuestionId : config.questionId;
  const pdfFieldId = useDefaultValue ? config.defaultPdfFieldId : config.pdfFieldId;
  const directive = useDefaultValue ? config.defaultDirective : config.directive;
  if (src === 'formField' && questionId != null && questionId !== '') {
    const v = data[questionId];
    return v ?? null;
  }
  if (src === 'pdfField' && pdfFieldId != null && pdfFieldId !== '' && options?.pdfFill) {
    const v = options.pdfFill[pdfFieldId];
    return v ?? null;
  }
  if (src === 'directive' && directive != null && directive !== '' && options?.resolvedProfiles) {
    const v = resolveDirective(directive, options.resolvedProfiles);
    return v ?? null;
  }
  const literal = useDefaultValue ? (config.defaultValue ?? null) : (config.setValue ?? null);
  if (literal !== undefined && literal !== null && literal !== '') return literal;
  return null;
}

/** Compute metadata object from output field definitions and current form data. */
export function computeMetadata(
  outputFields: OutputFieldDefinition[] | undefined,
  data: Record<string, unknown>,
  options?: ComputeMetadataOptions,
): Record<string, unknown> {
  if (!outputFields?.length) return {};
  const metadata: Record<string, unknown> = {};
  outputFields.forEach((field) => {
    if (field.key == null || String(field.key).trim() === '') return;
    let value: unknown = resolveOutputValue(
      field.defaultValueSource,
      {
        defaultValue: field.defaultValue,
        defaultQuestionId: field.defaultQuestionId,
        defaultPdfFieldId: field.defaultPdfFieldId,
        defaultDirective: field.defaultDirective,
      },
      data,
      options,
      true,
    );
    const matchingRule = field.rules.find(
      (rule) => getRuleConditions(rule).length > 0 && outputRuleMatches(rule, data),
    );
    if (matchingRule) {
      value = resolveOutputValue(
        matchingRule.valueSource,
        {
          setValue: matchingRule.setValue,
          questionId: matchingRule.questionId,
          pdfFieldId: matchingRule.pdfFieldId,
          directive: matchingRule.directive,
        },
        data,
        options,
        false,
      );
    }
    metadata[field.key] = value;
  });
  return metadata;
}
