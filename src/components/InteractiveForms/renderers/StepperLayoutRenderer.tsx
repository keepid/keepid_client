import type { Categorization, Category, LayoutProps } from '@jsonforms/core';
import { rankWith, resolveData, toDataPath, uiTypeIs } from '@jsonforms/core';
import { JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps } from '@jsonforms/react';
import React, { useEffect, useState } from 'react';

import { useRestoredForm, useWizardSubmit } from '../InteractiveFormWizardContext';

type CategoryWithRule = Category & { rule?: { effect: string; condition?: { scope?: string; schema?: { const?: unknown; not?: { const?: unknown } } } } };

function isCategoryHidden(
  category: CategoryWithRule,
  data: Record<string, unknown> | undefined,
  path: string,
): boolean {
  const rule = category?.rule;
  if (!rule || rule.effect !== 'HIDE' || !rule.condition?.scope || !rule.condition?.schema) return false;
  const basePath = path && path.length > 0 ? `${path}.` : '';
  const dataPath = basePath + toDataPath(rule.condition.scope);
  const value = resolveData(data ?? {}, dataPath);
  const schema = rule.condition.schema as { const?: unknown; not?: { const?: unknown } };
  if (schema.const !== undefined) return value === schema.const;
  if (schema.not?.const !== undefined) return value !== schema.not.const;
  return false;
}

function StepperLayoutRendererInner({
  uischema,
  schema,
  path,
  visible,
  data: dataFromProps,
}: LayoutProps) {
  const requestSubmit = useWizardSubmit();
  const startAtLastStep = useRestoredForm();
  const { core } = useJsonForms();
  const categorization = uischema as Categorization;
  const elements = (categorization.elements ?? []) as (Category | Categorization)[];
  const formData = core?.data ?? dataFromProps;
  const visibleIndices = elements
    .map((el, idx) => ({ el: el as CategoryWithRule, idx }))
    .filter(({ el }) => !isCategoryHidden(el, formData, path ?? ''))
    .map(({ idx }) => idx);

  const initialStep = startAtLastStep && visibleIndices.length > 0 ? visibleIndices.length - 1 : 0;
  const [activeStep, setActiveStep] = useState(initialStep);

  useEffect(() => {
    if (startAtLastStep && visibleIndices.length > 0) {
      setActiveStep(visibleIndices.length - 1);
    }
  }, [startAtLastStep, visibleIndices.length]);

  useEffect(() => {
    if (visibleIndices.length > 0 && activeStep >= visibleIndices.length) {
      setActiveStep(Math.max(0, visibleIndices.length - 1));
    }
  }, [visibleIndices.length, activeStep]);

  const safeStep = Math.max(0, Math.min(activeStep, visibleIndices.length - 1));
  const actualCategoryIndex = visibleIndices[safeStep] ?? 0;
  const category = elements[actualCategoryIndex] as Category;
  const isLast = safeStep === visibleIndices.length - 1;
  const hasConditionalSteps = elements.some((el) => (el as CategoryWithRule).rule != null);

  if (visible === false) return null;

  return (
    <div className="tw-flex tw-flex-col tw-gap-8">
      <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
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
                onClick={() => setActiveStep(visiblePos)}
                className={`tw-rounded-full tw-w-9 tw-h-9 tw-text-sm tw-font-semibold tw-transition-colors ${stepBtnClass}`}
                title={String(label)}
              >
                {visiblePos + 1}
              </button>
              {visiblePos < visibleIndices.length - 1 && (
                <div
                  className={`tw-w-6 tw-h-0.5 tw-rounded ${isPast ? 'tw-bg-primary-theme' : 'tw-bg-[#D9DEFF]'}`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="tw-text-sm tw-text-secondary-theme tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
        <span>
          Step {safeStep + 1} of {visibleIndices.length}: {category?.label ?? ''}
        </span>
        {hasConditionalSteps && (
          <span className="tw-text-gray-600 tw-text-xs">Some steps may be skipped based on your answers.</span>
        )}
      </div>

      <div className="tw-h-1 tw-bg-[#E8E9FF] tw-rounded-full tw-overflow-hidden">
        <div
          className="tw-h-full tw-bg-primary-theme tw-transition-all tw-duration-300"
          style={{ width: visibleIndices.length ? `${((safeStep + 1) / visibleIndices.length) * 100}%` : '0%' }}
        />
      </div>

      <div className="tw-min-h-[200px] tw-space-y-6">
        {category?.elements?.map((child: unknown, index: number) => (
          <JsonFormsDispatch
            key={`${path}-${actualCategoryIndex}-${(child as { scope?: string }).scope ?? `el-${index}`}`}
            uischema={child as import('@jsonforms/core').UISchemaElement}
            schema={schema}
            path={path}
          />
        ))}
      </div>

      <div className="tw-flex tw-justify-between tw-items-center tw-pt-6 tw-mt-2 tw-border-t tw-border-gray-200">
        {safeStep > 0 ? (
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            className="tw-px-4 tw-py-2 tw-text-primary-theme tw-bg-white tw-border tw-border-primary-theme tw-rounded-lg hover:tw-bg-[#E8E9FF] tw-text-sm tw-font-medium"
          >
            ← Previous
          </button>
        ) : (
          <div />
        )}
        {!isLast ? (
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.min(visibleIndices.length - 1, s + 1))}
            className="tw-px-6 tw-py-2 tw-bg-primary-theme tw-text-white tw-rounded-lg hover:tw-bg-[#3B54D3] tw-text-sm tw-font-medium"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => requestSubmit?.()}
            className="tw-px-6 tw-py-2 tw-bg-secondary-theme tw-text-white tw-rounded-lg hover:tw-bg-[#343347] tw-text-sm tw-font-medium"
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
