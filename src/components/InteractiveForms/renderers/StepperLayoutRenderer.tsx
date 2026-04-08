import type { Categorization, Category, LayoutProps } from '@jsonforms/core';
import { rankWith, resolveData, toDataPath, uiTypeIs } from '@jsonforms/core';
import { JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps } from '@jsonforms/react';
import React, { useEffect, useState } from 'react';

import { useRestoredForm, useWizardBack, useWizardSubmit } from '../InteractiveFormWizardContext';

type RuleSchema = { const?: unknown; not?: { const?: unknown }; minLength?: number; maxLength?: number };
type RuleCondition = { scope?: string; schema?: RuleSchema; allOf?: RuleCondition[]; anyOf?: RuleCondition[] };
type CategoryWithRule = Category & { rule?: { effect: string; condition?: RuleCondition } };

function evaluateRuleCondition(
  condition: RuleCondition | undefined,
  data: Record<string, unknown> | undefined,
  path: string,
): boolean {
  if (!condition) return false;
  if (Array.isArray(condition.allOf) && condition.allOf.length > 0) {
    return condition.allOf.every((c) => evaluateRuleCondition(c, data, path));
  }
  if (Array.isArray(condition.anyOf) && condition.anyOf.length > 0) {
    return condition.anyOf.some((c) => evaluateRuleCondition(c, data, path));
  }
  if (!condition.scope || !condition.schema) return false;
  const basePath = path && path.length > 0 ? `${path}.` : '';
  const dataPath = basePath + toDataPath(condition.scope);
  const value = resolveData(data ?? {}, dataPath);
  const schema = condition.schema;
  if (schema.const !== undefined) return value === schema.const;
  if (schema.not?.const !== undefined) return value !== schema.not.const;
  if (typeof schema.minLength === 'number') return String(value ?? '').length >= schema.minLength;
  if (typeof schema.maxLength === 'number') return String(value ?? '').length <= schema.maxLength;
  return false;
}

function isCategoryHidden(
  category: CategoryWithRule,
  data: Record<string, unknown> | undefined,
  path: string,
): boolean {
  const rule = category?.rule;
  if (!rule || rule.effect !== 'HIDE') return false;
  return evaluateRuleCondition(rule.condition, data, path);
}

function StepperLayoutRendererInner({
  uischema,
  schema,
  path,
  visible,
  data: dataFromProps,
}: LayoutProps) {
  const requestSubmit = useWizardSubmit();
  const requestBack = useWizardBack();
  const startAtLastStep = useRestoredForm();
  const { core } = useJsonForms();
  const categorization = uischema as Categorization;
  const elements = (categorization.elements ?? []) as (Category | Categorization)[];
  const formData = core?.data ?? dataFromProps;
  const visibleIndices = elements
    .map((el, idx) => ({ el: el as CategoryWithRule, idx }))
    .filter(({ el }) => !isCategoryHidden(el, formData, path ?? ''))
    .map(({ idx }) => idx);

  const initialCategoryIndex = startAtLastStep && visibleIndices.length > 0
    ? visibleIndices[visibleIndices.length - 1]
    : (visibleIndices[0] ?? 0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(initialCategoryIndex);

  useEffect(() => {
    if (startAtLastStep && visibleIndices.length > 0) {
      setActiveCategoryIndex(visibleIndices[visibleIndices.length - 1]);
    }
  }, [startAtLastStep, visibleIndices]);

  useEffect(() => {
    if (visibleIndices.length === 0) return;
    setActiveCategoryIndex((current) => {
      if (visibleIndices.includes(current)) return current;
      const nextVisible = visibleIndices.find((idx) => idx > current);
      if (nextVisible !== undefined) return nextVisible;
      return visibleIndices[visibleIndices.length - 1];
    });
  }, [visibleIndices]);

  if (visibleIndices.length === 0 || visible === false) return null;

  const activeVisiblePos = visibleIndices.indexOf(activeCategoryIndex);
  const safeStep = activeVisiblePos >= 0 ? activeVisiblePos : 0;
  const actualCategoryIndex = visibleIndices[safeStep] ?? visibleIndices[0];
  const category = elements[actualCategoryIndex] as Category;
  const isLast = safeStep === visibleIndices.length - 1;
  const hasConditionalSteps = elements.some((el) => (el as CategoryWithRule).rule != null);

  return (
    <div className="tw-flex tw-flex-col tw-gap-10">
      <div className="tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
        {visibleIndices.map((actualIdx, visiblePos) => {
          const el = elements[actualIdx] as Category;
          const label = el?.label ?? `Step ${visiblePos + 1}`;
          const isActive = visiblePos === safeStep;
          const isPast = visiblePos < safeStep;
          let stepBtnClass =
            'tw-bg-[#E8E9FF] tw-text-secondary-theme tw-border tw-border-primary-theme hover:tw-bg-[#D9DEFF]';
          if (isActive) stepBtnClass = 'tw-bg-primary-theme tw-text-white tw-border tw-border-primary-theme tw-ring-2 tw-ring-[#C9D2FF]';
          else if (isPast) stepBtnClass = 'tw-bg-secondary-theme tw-text-white tw-border tw-border-secondary-theme';
          return (
            <React.Fragment key={actualIdx}>
              <button
                type="button"
                onClick={() => setActiveCategoryIndex(actualIdx)}
                className={`tw-rounded-full tw-w-12 tw-h-12 tw-text-base tw-font-semibold tw-transition-colors ${stepBtnClass}`}
                title={String(label)}
              >
                {visiblePos + 1}
              </button>
              {visiblePos < visibleIndices.length - 1 && (
                <div
                  className={`tw-w-8 tw-h-1 tw-rounded ${isPast ? 'tw-bg-primary-theme' : 'tw-bg-[#D9DEFF]'}`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="tw-text-lg tw-text-secondary-theme tw-flex tw-items-center tw-gap-3 tw-flex-wrap">
        <span>
          Step {safeStep + 1} of {visibleIndices.length}: {category?.label ?? ''}
        </span>
        {hasConditionalSteps && (
          <span className="tw-text-gray-600 tw-text-sm">Some steps may be skipped based on your answers.</span>
        )}
      </div>

      <div className="tw-h-1.5 tw-bg-[#E8E9FF] tw-rounded-full tw-overflow-hidden">
        <div
          className="tw-h-full tw-bg-primary-theme tw-transition-all tw-duration-300"
          style={{ width: visibleIndices.length ? `${((safeStep + 1) / visibleIndices.length) * 100}%` : '0%' }}
        />
      </div>

      <div className="tw-min-h-[240px] tw-space-y-8">
        {category?.elements?.map((child: unknown, index: number) => (
          <JsonFormsDispatch
            key={`${path}-${actualCategoryIndex}-${(child as { scope?: string }).scope ?? `el-${index}`}`}
            uischema={child as import('@jsonforms/core').UISchemaElement}
            schema={schema}
            path={path}
          />
        ))}
      </div>

      <div className="tw-flex tw-justify-between tw-items-center tw-gap-4 tw-pt-8 tw-mt-4 tw-border-t-2 tw-border-gray-200">
        {(() => {
          const backBtnClass =
            'tw-px-6 tw-py-3 tw-min-h-[3rem] tw-text-primary-theme tw-bg-white tw-border-2 tw-border-primary-theme tw-rounded-lg hover:tw-bg-[#E8E9FF] tw-text-base tw-font-semibold';
          if (safeStep > 0) {
            return (
              <button
                type="button"
                onClick={() => setActiveCategoryIndex((current) => {
                  const currentPos = Math.max(0, visibleIndices.indexOf(current));
                  const prevPos = Math.max(0, currentPos - 1);
                  return visibleIndices[prevPos] ?? current;
                })}
                className={backBtnClass}
              >
                ← Previous
              </button>
            );
          }
          if (requestBack) {
            return (
              <button type="button" onClick={() => requestBack()} className={backBtnClass}>
                ← Back
              </button>
            );
          }
          return <div />;
        })()}
        {!isLast ? (
          <button
            type="button"
            onClick={() => setActiveCategoryIndex((current) => {
              const currentPos = Math.max(0, visibleIndices.indexOf(current));
              const nextPos = Math.min(visibleIndices.length - 1, currentPos + 1);
              return visibleIndices[nextPos] ?? current;
            })}
            className="tw-px-8 tw-py-3 tw-min-h-[3rem] tw-bg-primary-theme tw-text-white tw-rounded-lg hover:tw-bg-[#3B54D3] tw-text-base tw-font-semibold"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => requestSubmit?.()}
            className="tw-px-8 tw-py-3 tw-min-h-[3rem] tw-bg-secondary-theme tw-text-white tw-rounded-lg hover:tw-bg-[#343347] tw-text-base tw-font-semibold"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

const StepperLayoutRenderer = withJsonFormsLayoutProps(StepperLayoutRendererInner, false);

export const stepperLayoutTester = rankWith(
  2,
  (uischema, _schema, _context) => {
    if (!uiTypeIs('Categorization')(uischema, _schema, _context)) return false;
    const opts = (uischema as Categorization & { options?: { variant?: string } }).options;
    return opts?.variant === 'stepper';
  },
);

export default StepperLayoutRenderer;
