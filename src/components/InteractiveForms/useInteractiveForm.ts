import { useCallback, useEffect, useState } from 'react';

import {
  canonicalDirectiveForTarget,
  getByPath,
  isExcludedFromProfileFormSync,
  isResolvableDirective,
  normalizeDateLikeValue,
  resolveDirectiveFromProfilesForTarget,
} from '../../utils/directives';
import { smartTitleCase } from '../../utils/textCase';
import {
  type GetQuestionsV2Response,
  getInteractiveFormConfig,
  getQuestionsV2,
} from '../Applications/api/interactiveForm';
import type { BuilderState } from './types';

export interface UseInteractiveFormOptions {
  applicationId: string | null;
  clientUsername?: string;
}

export interface UseInteractiveFormResult {
  loading: boolean;
  error: string | null;
  jsonSchema: Record<string, unknown> | null;
  uiSchema: Record<string, unknown> | null;
  resolvedProfiles: GetQuestionsV2Response['resolvedProfiles'] | null;
  builderState: BuilderState | null;
  formTitle: string;
  getFormAnswers: (wizardData: Record<string, unknown>) => Record<string, unknown>;
  /** Initial form data with directive values pre-filled from resolvedProfiles. */
  getInitialData: () => Record<string, unknown>;
}

function conditionMatches(
  condition: { scope?: string; schema?: Record<string, unknown> },
  data: Record<string, unknown>,
): boolean {
  const schema = condition.schema as Record<string, unknown> | undefined;
  if (!schema) return true;
  const scope = condition.scope ?? '';
  const propPath = scope.replace('#/properties/', '').replace(/\//g, '.');
  const value = propPath ? getByPath(data as Record<string, unknown>, propPath) : undefined;
  if (schema.const !== undefined) return value === schema.const;
  const notSchema = schema.not as Record<string, unknown> | undefined;
  if (notSchema?.const !== undefined) return value !== notSchema.const;
  return false;
}

export function fillConditionMatches(
  fillCondition: Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined,
  data: Record<string, unknown>,
): boolean {
  if (!fillCondition || fillCondition.length === 0) return true;
  return fillCondition.every((c) => conditionMatches(c, data));
}

function formatDateForPdf(value: unknown): unknown {
  const normalized = normalizeDateLikeValue(value);
  if (normalized !== value) return normalized;
  if (value instanceof Date) {
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    const yyyy = value.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [y, m, d] = value.slice(0, 10).split('-');
    return `${m}/${d}/${y}`;
  }
  return value;
}

const NON_TITLE_CASE_FORMATS = new Set(['date', 'date-time', 'email', 'time', 'uri', 'url', 'uuid']);

function getScopePath(scope: string): string {
  return scope.replace('#/properties/', '').replace(/\//g, '.');
}

function getSchemaForPath(
  jsonSchema: Record<string, unknown> | null | undefined,
  propPath: string,
): Record<string, unknown> | undefined {
  const props = jsonSchema?.properties as Record<string, unknown> | undefined;
  const direct = props?.[propPath];
  if (direct && typeof direct === 'object') return direct as Record<string, unknown>;
  return propPath.split('.').reduce<Record<string, unknown> | undefined>((schema, part) => {
    const nestedProps = schema?.properties as Record<string, unknown> | undefined;
    const next = nestedProps?.[part];
    return next && typeof next === 'object' ? next as Record<string, unknown> : undefined;
  }, jsonSchema);
}

function isTitleCaseTextSchema(schema: Record<string, unknown> | undefined): boolean {
  if (!schema) return false;
  if (schema.type !== 'string') return false;
  if (Array.isArray(schema.enum)) return false;
  const format = typeof schema.format === 'string' ? schema.format.toLowerCase() : '';
  return !NON_TITLE_CASE_FORMATS.has(format);
}

function shouldSkipTitleCaseValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!/\p{L}/u.test(trimmed)) return true;
  if (trimmed.includes('@')) return true;
  if (/^(?:https?:\/\/|www\.)/i.test(trimmed)) return true;
  if (trimmed.includes('_')) return true;
  return false;
}

export function titleCaseTextFieldValue(value: string): string {
  if (shouldSkipTitleCaseValue(value)) return value;
  return smartTitleCase(value);
}

function formatTextValue(value: unknown, shouldTitleCase: boolean): unknown {
  if (!shouldTitleCase || typeof value !== 'string') return value;
  return titleCaseTextFieldValue(value);
}

function formatValueForPdf(value: unknown, shouldTitleCase: boolean): unknown {
  return formatTextValue(formatDateForPdf(value), shouldTitleCase);
}

export function normalizeTextFieldValues(
  data: Record<string, unknown>,
  jsonSchema: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const props = jsonSchema?.properties as Record<string, unknown> | undefined;
  if (!props) return data;

  let next: Record<string, unknown> | null = null;
  Object.entries(props).forEach(([key, schema]) => {
    if (!isTitleCaseTextSchema(schema as Record<string, unknown> | undefined)) return;
    const current = data[key];
    if (typeof current !== 'string') return;
    const formatted = titleCaseTextFieldValue(current);
    if (formatted === current) return;
    if (!next) next = { ...data };
    next[key] = formatted;
  });
  return next ?? data;
}

function resolveConditionalDirective(
  directiveArray: Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
  data: Record<string, unknown>,
): string | null {
  const match = directiveArray.find((entry) => !entry.when || conditionMatches(entry.when, data));
  return match?.use ?? null;
}

function targetText(...values: unknown[]): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .join(' ');
}

/**
 * Scope of the group sub-field that shares a group-level fill's directive. A group-level fill
 * reads that sub-field's answer, so the last-name fill never takes the first name.
 */
function subFieldScopeForDirective(elements: Record<string, unknown>[], directive: unknown): string | undefined {
  if (typeof directive !== 'string') return undefined;
  const sub = elements.find((el) => (el.options as Record<string, unknown> | undefined)?.directive === directive);
  return typeof sub?.scope === 'string' ? sub.scope : undefined;
}

export function buildFormAnswers(
  uiSchema: Record<string, unknown>,
  jsonSchema: Record<string, unknown>,
  data: Record<string, unknown>,
  resolvedProfiles: GetQuestionsV2Response['resolvedProfiles'] | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const ON_PLACEHOLDER = 'On';

  function getPropValue(scope: string): unknown {
    return getByPath(data, getScopePath(scope));
  }

  function isBooleanScope(scope: string): boolean {
    return getSchemaForPath(jsonSchema, getScopePath(scope))?.type === 'boolean';
  }

  function isTitleCaseTextScope(scope: string): boolean {
    return isTitleCaseTextSchema(getSchemaForPath(jsonSchema, getScopePath(scope)));
  }

  function processElement(element: Record<string, unknown>) {
    const type = element.type as string;

    if (type === 'Control') {
      const scope = element.scope as string | undefined;
      const options = element.options as Record<string, unknown> | undefined;
      const optionMappings = options?.optionMappings as Array<Record<string, unknown>> | undefined;
      const hasOptionMappings = Array.isArray(optionMappings) && optionMappings.length > 0;

      // Avoid generic value->pdfField fallback for controls that define explicit optionMappings.
      // For shared group targets (radio-style PDFs), generic fallback commonly emits UI labels or booleans
      // that are not valid PDF option tokens.
      if (options?.pdfField && scope && !hasOptionMappings) {
        const pdfField = options.pdfField as string;
        // A question's PDF field is filled from its answer only. The directive pre-filled that
        // answer (buildInitialData), so an edited or cleared answer is what reaches the PDF.
        let value: unknown = getPropValue(scope);
        const boolScope = isBooleanScope(scope);
        if (boolScope || typeof value === 'boolean') {
          const isChecked = value === true || value === 'true' || value === 1 || value === '1';
          if (isChecked) {
            const token = (typeof options.fillValue === 'string' && options.fillValue !== '')
              ? options.fillValue
              : 'true';
            out[pdfField] = token;
          }
        } else if (value !== undefined && value !== null && value !== '') {
          const hasExplicitFill = options.fillValue !== undefined && options.fillValue !== null;
          if (hasExplicitFill) value = options.fillValue;
          out[pdfField] = formatValueForPdf(value, isTitleCaseTextScope(scope) && !hasExplicitFill);
        }
      }

      if (optionMappings && scope) {
        const currentVal = getPropValue(scope);
        const mappingCountByPdfField = optionMappings.reduce<Record<string, number>>((acc, m) => {
          const key = m.pdfField as string | undefined;
          if (!key) return acc;
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        optionMappings.forEach((m) => {
          const pdfField = m.pdfField as string | undefined;
          const forOption = m.forOption as string | undefined;
          if (!pdfField || forOption == null) return;
          if (currentVal !== forOption) return;
          const explicitFill = m.fillValue;
          const isSharedGroupField = (mappingCountByPdfField[pdfField] ?? 0) > 1;
          let fillVal: unknown;
          if (isSharedGroupField) {
            // Tight mapping for shared-group targets: require an explicit PDF token;
            // never fall back to the UI option value.
            if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
              if (explicitFill === ON_PLACEHOLDER) return;
              fillVal = explicitFill;
            } else {
              return;
            }
          } else if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
            fillVal = explicitFill;
          } else {
            fillVal = currentVal;
          }
          if (fillVal !== undefined) out[pdfField] = formatDateForPdf(fillVal);
        });
      }

      const conditionalFills = options?.conditionalFills as Array<Record<string, unknown>> | undefined;
      if (conditionalFills && scope) {
        const baseValue = getPropValue(scope);
        conditionalFills.forEach((cf) => {
          const pdfField = cf.pdfField as string | undefined;
          const fillCond = cf.fillCondition as Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined;
          if (!pdfField) return;
          if (!fillConditionMatches(fillCond, data)) return;
          const fillVal = cf.fillValue ?? baseValue;
          if (fillVal !== undefined && fillVal !== null && fillVal !== '') {
            const usesBaseValue = cf.fillValue === undefined;
            out[pdfField] = formatValueForPdf(fillVal, usesBaseValue && isTitleCaseTextScope(scope));
          }
        });
      }
      return;
    }

    if (type === 'Group' && Array.isArray(element.elements)) {
      const groupOptions = element.options as Record<string, unknown> | undefined;
      const optionMappings = groupOptions?.optionMappings as Array<Record<string, unknown>> | undefined;
      const conditionalFills = groupOptions?.conditionalFills as Array<Record<string, unknown>> | undefined;

      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));

      const firstScope = (element.elements as Record<string, unknown>[]).find((e) => e.scope)?.scope as string | undefined;
      if (optionMappings && firstScope) {
        const val = getPropValue(firstScope);
        const mappingCountByPdfField = optionMappings.reduce<Record<string, number>>((acc, m) => {
          const key = m.pdfField as string | undefined;
          if (!key) return acc;
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});
        optionMappings.forEach((m) => {
          const pdfField = m.pdfField as string | undefined;
          const forOption = m.forOption as string | undefined;
          if (!pdfField || forOption == null) return;
          if (val === forOption) {
            const explicitFill = m.fillValue;
            const isSharedGroupField = (mappingCountByPdfField[pdfField] ?? 0) > 1;
            let fillVal: unknown;
            if (isSharedGroupField) {
              // Same strict behavior for Group-level mappings.
              if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
                if (explicitFill === ON_PLACEHOLDER) return;
                fillVal = explicitFill;
              } else {
                return;
              }
            } else if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
              fillVal = explicitFill;
            } else {
              fillVal = val;
            }
            if (fillVal !== undefined) out[pdfField] = formatDateForPdf(fillVal);
          }
        });
      }
      if (conditionalFills) {
        conditionalFills.forEach((cf) => {
          const pdfField = cf.pdfField as string | undefined;
          const fillCond = cf.fillCondition as Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined;
          if (!pdfField) return;
          if (!fillConditionMatches(fillCond, data)) return;
          // Literal fills need no source. Otherwise each fill reads its own sub-field's answer.
          const sourceScope = subFieldScopeForDirective(element.elements as Record<string, unknown>[], cf.directive);
          const fillVal = cf.fillValue ?? (sourceScope !== undefined ? getPropValue(sourceScope) : undefined);
          if (fillVal !== undefined && fillVal !== null && fillVal !== '') {
            const usesBaseValue = cf.fillValue === undefined && sourceScope !== undefined;
            out[pdfField] = formatValueForPdf(fillVal, usesBaseValue && isTitleCaseTextScope(sourceScope));
          }
        });
      }
      return;
    }

    if (type === 'Category' && Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      return;
    }

    if (type === 'Categorization' && Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      return;
    }

    if (Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
    }
  }

  processElement(uiSchema);
  return out;
}

/** Build initial form data by resolving directives from resolvedProfiles. */
export function buildInitialData(
  uiSchema: Record<string, unknown>,
  resolvedProfiles: GetQuestionsV2Response['resolvedProfiles'] | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  function setByScope(scope: string, value: unknown) {
    if (value === undefined || value === null) return;
    const propPath = scope.replace('#/properties/', '').replace(/\//g, '.');
    if (!propPath) return;
    const parts = propPath.split('.');
    const last = parts.pop();
    if (!last) return;
    const parent = parts.reduce<Record<string, unknown>>((acc, p) => {
      if (!(p in acc) || typeof acc[p] !== 'object') {
        acc[p] = {};
      }
      return acc[p] as Record<string, unknown>;
    }, out);
    parent[last] = value;
  }

  function processElement(element: Record<string, unknown>) {
    const type = element.type as string;

    if (type === 'Control') {
      const scope = element.scope as string | undefined;
      const options = element.options as Record<string, unknown> | undefined;
      if (!scope) return;

      let value: unknown;
      const directive = options?.directive;
      if (directive != null && resolvedProfiles) {
        if (typeof directive === 'string') {
          value = resolveDirectiveFromProfilesForTarget(
            directive,
            resolvedProfiles,
            targetText(element.label, scope),
          );
        } else if (Array.isArray(directive)) {
          const useDirective = resolveConditionalDirective(
            directive as Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
            out,
          );
          if (useDirective) {
            value = resolveDirectiveFromProfilesForTarget(
              useDirective,
              resolvedProfiles,
              targetText(element.label, scope),
            );
          }
        }
      }
      if (options?.fillValue !== undefined && options?.fillValue !== null) {
        value = options.fillValue;
      }
      if (value !== undefined && value !== null && value !== '') {
        setByScope(scope, value);
      }
      return;
    }

    if (type === 'Group' && Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      return;
    }
    if (type === 'Category' && Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      return;
    }
    if (type === 'Categorization' && Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      return;
    }
    if (Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
    }
  }

  processElement(uiSchema);
  return out;
}

export function useInteractiveForm({
  applicationId,
  clientUsername = '',
}: UseInteractiveFormOptions): UseInteractiveFormResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jsonSchema, setJsonSchema] = useState<Record<string, unknown> | null>(null);
  const [uiSchema, setUiSchema] = useState<Record<string, unknown> | null>(null);
  const [resolvedProfiles, setResolvedProfiles] = useState<GetQuestionsV2Response['resolvedProfiles'] | null>(null);
  const [builderState, setBuilderState] = useState<BuilderState | null>(null);
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      setJsonSchema(null);
      setUiSchema(null);
      setResolvedProfiles(null);
      setBuilderState(null);
      setFormTitle('');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      getInteractiveFormConfig(applicationId),
      getQuestionsV2(applicationId, clientUsername || undefined),
    ])
      .then(([config, questions]) => {
        setJsonSchema(config.jsonSchema);
        setUiSchema(config.uiSchema);
        setResolvedProfiles(questions.resolvedProfiles ?? null);
        setBuilderState((config.builderState as BuilderState) ?? null);
        setFormTitle(questions.title ?? '');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load form');
        setJsonSchema(null);
        setUiSchema(null);
        setResolvedProfiles(null);
        setBuilderState(null);
        setFormTitle('');
      })
      .finally(() => setLoading(false));
  }, [applicationId, clientUsername]);

  const getFormAnswers = useCallback(
    (wizardData: Record<string, unknown>): Record<string, unknown> => {
      if (!uiSchema || !jsonSchema) return {};
      return buildFormAnswers(uiSchema, jsonSchema, wizardData, resolvedProfiles);
    },
    [uiSchema, jsonSchema, resolvedProfiles],
  );

  const getInitialData = useCallback((): Record<string, unknown> => {
    if (!uiSchema || !resolvedProfiles) return {};
    return buildInitialData(uiSchema, resolvedProfiles);
  }, [uiSchema, resolvedProfiles]);

  return {
    loading,
    error,
    jsonSchema,
    uiSchema,
    resolvedProfiles,
    builderState,
    formTitle,
    getFormAnswers,
    getInitialData,
  };
}

export function extractDirectivesFromUiSchema(
  uiSchema: Record<string, unknown>,
  data: Record<string, unknown>,
  jsonSchema?: Record<string, unknown> | null,
  extractionOptions: { includeExcluded?: boolean } = {},
): Record<string, unknown> {
  const directivesMap: Record<string, unknown> = {};

  function getPropValue(scope: string): unknown {
    return getByPath(data, getScopePath(scope));
  }

  function isTitleCaseTextScope(scope: string): boolean {
    return isTitleCaseTextSchema(getSchemaForPath(jsonSchema, getScopePath(scope)));
  }

  function sourceDirectiveForFormValue(directive: string): string {
    return directive.replace(
      /^(client|worker|director)\.\$(?:dob_mm\/dd\/yyyy|dob_month_day_year|dob_mmmm_d_yyyy|dobMonthDayYear|birthDateLong)$/i,
      '$1.birthDate',
    );
  }

  function addDirectiveValue(
    directive: unknown,
    scope: string,
    targetName: string,
  ) {
    const value = getPropValue(scope);
    if (value === undefined || value === null || value === '') return;

    let selectedDirective: string | null = null;
    if (typeof directive === 'string') {
      selectedDirective = directive;
    } else if (Array.isArray(directive)) {
      selectedDirective = resolveConditionalDirective(
        directive as Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
        data,
      );
    }
    if (!selectedDirective) return;

    // Computed DOB directives are document outputs, not writable profile fields. Send their
    // birthDate source so the server can recompute every requested DOB format consistently.
    const profileDirective = sourceDirectiveForFormValue(
      canonicalDirectiveForTarget(selectedDirective, targetName),
    );
    // A retired or unknown directive is not a profile field, so it is not saved back.
    if (!isResolvableDirective(profileDirective)) return;
    if (!extractionOptions.includeExcluded && isExcludedFromProfileFormSync(profileDirective)) return;
    directivesMap[profileDirective] = formatTextValue(value, isTitleCaseTextScope(scope));
  }

  function processElement(element: Record<string, unknown>) {
    const type = element.type as string;

    if (type === 'Control') {
      const scope = element.scope as string | undefined;
      const options = element.options as Record<string, unknown> | undefined;
      const directive = options?.directive;

      if (scope && directive != null) {
        addDirectiveValue(directive, scope, targetText(element.label, scope));
      }

      if (scope) {
        const optionMappings = options?.optionMappings as Array<Record<string, unknown>> | undefined;
        const currentValue = getPropValue(scope);
        optionMappings?.forEach((mapping) => {
          if (mapping.forOption !== currentValue) return;
          addDirectiveValue(
            mapping.directive,
            scope,
            targetText(element.label, mapping.pdfField, scope),
          );
        });

        const conditionalFills = options?.conditionalFills as Array<Record<string, unknown>> | undefined;
        conditionalFills?.forEach((fill) => {
          const conditions = fill.fillCondition as Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined;
          if (!fillConditionMatches(conditions, data)) return;
          addDirectiveValue(
            fill.directive,
            scope,
            targetText(element.label, fill.pdfField, scope),
          );
        });
      }
      return;
    }

    if (type === 'Group') {
      if (Array.isArray(element.elements)) {
        (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));

        const firstScope = (element.elements as Record<string, unknown>[])
          .find((child) => typeof child.scope === 'string')?.scope as string | undefined;
        const options = element.options as Record<string, unknown> | undefined;
        if (firstScope) {
          const currentValue = getPropValue(firstScope);
          const optionMappings = options?.optionMappings as Array<Record<string, unknown>> | undefined;
          optionMappings?.forEach((mapping) => {
            if (mapping.forOption !== currentValue) return;
            addDirectiveValue(
              mapping.directive,
              firstScope,
              targetText(element.label, mapping.pdfField, firstScope),
            );
          });

          const conditionalFills = options?.conditionalFills as Array<Record<string, unknown>> | undefined;
          conditionalFills?.forEach((fill) => {
            const conditions = fill.fillCondition as Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined;
            if (!fillConditionMatches(conditions, data)) return;
            // Sync the answer of the sub-field this fill shares a directive with.
            const sourceScope = subFieldScopeForDirective(element.elements as Record<string, unknown>[], fill.directive);
            if (!sourceScope) return;
            addDirectiveValue(
              fill.directive,
              sourceScope,
              targetText(element.label, fill.pdfField, sourceScope),
            );
          });
        }
      }
      return;
    }

    if (type === 'Category' || type === 'Categorization') {
      if (Array.isArray(element.elements)) {
        (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
      }
      return;
    }

    if (Array.isArray(element.elements)) {
      (element.elements as Record<string, unknown>[]).forEach((el) => processElement(el));
    }
  }

  processElement(uiSchema);
  return directivesMap;
}
