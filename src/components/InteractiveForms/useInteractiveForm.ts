import { useCallback, useEffect, useState } from 'react';

import { getByPath, isExcludedFromProfileFormSync, resolveDirectiveFromProfiles } from '../../utils/directives';
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

function fillConditionMatches(
  fillCondition: Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined,
  data: Record<string, unknown>,
): boolean {
  if (!fillCondition || fillCondition.length === 0) return true;
  return fillCondition.every((c) => conditionMatches(c, data));
}

function formatDateForPdf(value: unknown): unknown {
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

function resolveConditionalDirective(
  directiveArray: Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
  data: Record<string, unknown>,
): string | null {
  const match = directiveArray.find((entry) => !entry.when || conditionMatches(entry.when, data));
  return match?.use ?? null;
}

function buildFormAnswers(
  uiSchema: Record<string, unknown>,
  jsonSchema: Record<string, unknown>,
  data: Record<string, unknown>,
  resolvedProfiles: GetQuestionsV2Response['resolvedProfiles'] | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const ON_PLACEHOLDER = 'On';

  function getPropValue(scope: string): unknown {
    const propPath = scope.replace('#/properties/', '').replace(/\//g, '.');
    return getByPath(data, propPath);
  }

  function isBooleanScope(scope: string): boolean {
    const propPath = scope.replace('#/properties/', '').replace(/\//g, '.');
    const props = (jsonSchema.properties as Record<string, { type?: unknown }> | undefined) ?? {};
    return props[propPath]?.type === 'boolean';
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
        let value: unknown = getPropValue(scope);
        const directive = options.directive;
        if (directive != null && resolvedProfiles) {
          if (typeof directive === 'string') {
            const resolved = resolveDirectiveFromProfiles(directive, resolvedProfiles);
            if (resolved !== undefined) value = resolved;
          } else if (Array.isArray(directive)) {
            const useDirective = resolveConditionalDirective(
              directive as Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
              data,
            );
            if (useDirective) {
              const resolved = resolveDirectiveFromProfiles(useDirective, resolvedProfiles);
              if (resolved !== undefined) value = resolved;
            }
          }
        }
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
          if (options.fillValue !== undefined && options.fillValue !== null) value = options.fillValue;
          out[pdfField] = formatDateForPdf(value);
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
            // Tight mapping for shared-group targets:
            // require an explicit PDF token or directive result; never fall back to UI option value.
            if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
              if (explicitFill === ON_PLACEHOLDER) return;
              fillVal = explicitFill;
            } else if (m.directive && resolvedProfiles) {
              fillVal = resolveDirectiveFromProfiles(m.directive as string, resolvedProfiles);
            } else {
              return;
            }
          } else if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
            fillVal = explicitFill;
          } else if (m.directive && resolvedProfiles) {
            fillVal = resolveDirectiveFromProfiles(m.directive as string, resolvedProfiles);
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
          const fillVal = cf.fillValue ?? (resolvedProfiles && cf.directive
            ? resolveDirectiveFromProfiles(cf.directive as string, resolvedProfiles)
            : baseValue);
          if (fillVal !== undefined && fillVal !== null && fillVal !== '') {
            out[pdfField] = formatDateForPdf(fillVal);
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
              } else if (m.directive && resolvedProfiles) {
                fillVal = resolveDirectiveFromProfiles(m.directive as string, resolvedProfiles);
              } else {
                return;
              }
            } else if (explicitFill !== undefined && explicitFill !== null && explicitFill !== '') {
              fillVal = explicitFill;
            } else if (m.directive && resolvedProfiles) {
              fillVal = resolveDirectiveFromProfiles(m.directive as string, resolvedProfiles);
            } else {
              fillVal = val;
            }
            if (fillVal !== undefined) out[pdfField] = formatDateForPdf(fillVal);
          }
        });
      }
      if (conditionalFills && firstScope) {
        const baseValue = getPropValue(firstScope);
        conditionalFills.forEach((cf) => {
          const pdfField = cf.pdfField as string | undefined;
          const fillCond = cf.fillCondition as Array<{ scope?: string; schema?: Record<string, unknown> }> | undefined;
          if (!pdfField) return;
          if (!fillConditionMatches(fillCond, data)) return;
          const fillVal = cf.fillValue ?? (cf.directive && resolvedProfiles
            ? resolveDirectiveFromProfiles(cf.directive as string, resolvedProfiles) : baseValue);
          if (fillVal !== undefined && fillVal !== null && fillVal !== '') {
            out[pdfField] = formatDateForPdf(fillVal);
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
function buildInitialData(
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
          value = resolveDirectiveFromProfiles(directive, resolvedProfiles);
        } else if (Array.isArray(directive)) {
          const useDirective = resolveConditionalDirective(
            directive as Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
            out,
          );
          if (useDirective) {
            value = resolveDirectiveFromProfiles(useDirective, resolvedProfiles);
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
): Record<string, unknown> {
  const directivesMap: Record<string, unknown> = {};

  function getPropValue(scope: string): unknown {
    const propPath = scope.replace('#/properties/', '').replace(/\//g, '.');
    return getByPath(data, propPath);
  }

  function processElement(element: Record<string, unknown>) {
    const type = element.type as string;

    if (type === 'Control') {
      const scope = element.scope as string | undefined;
      const options = element.options as Record<string, unknown> | undefined;
      const directive = options?.directive;

      if (scope && directive != null) {
        const value = getPropValue(scope);
        if (value !== undefined && value !== null && value !== '') {
          if (typeof directive === 'string') {
            if (!isExcludedFromProfileFormSync(directive)) {
              directivesMap[directive] = value;
            }
          } else if (Array.isArray(directive)) {
            const useDirective = resolveConditionalDirective(
              directive as Array<{ when?: { scope?: string; schema?: Record<string, unknown> }; use: string }>,
              data,
            );
            if (useDirective && !isExcludedFromProfileFormSync(useDirective)) {
              directivesMap[useDirective] = value;
            }
          }
        }
      }
      return;
    }

    if (type === 'Group' || type === 'Category' || type === 'Categorization') {
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
