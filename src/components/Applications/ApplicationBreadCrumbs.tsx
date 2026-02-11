import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';

import { capitalizeFirst } from '../Utils/StringUtils';
import { formContent } from './Hooks/ApplicationFormHook';

function stepLabelColor(isCurrent: boolean, isComplete: boolean): string {
  if (isCurrent) return 'tw-text-indigo-600';
  if (isComplete) return 'tw-text-gray-700 group-hover:tw-text-indigo-600';
  return 'tw-text-gray-400';
}

interface ApplicationBreadCrumbsProps {
  page: number;
  setPage: (e: number) => void;
}

export default function ApplicationBreadCrumbs({ page, setPage }: ApplicationBreadCrumbsProps) {
  return (
    <nav aria-label="Progress" className="tw-py-4">
      <ol className="tw-flex tw-items-center tw-justify-between tw-gap-0">
        {formContent.map((step, idx) => {
          const label = step.displayName || capitalizeFirst(step.pageName);
          const isComplete = idx < page;
          const isCurrent = idx === page;

          return (
            <li key={step.pageName} className="tw-flex tw-items-center tw-flex-1 last:tw-flex-none">
              {/* Step indicator */}
              <button
                type="button"
                className="tw-flex tw-flex-col tw-items-center tw-gap-1 tw-bg-transparent tw-border-0 tw-cursor-pointer tw-group tw-min-w-0"
                onClick={() => isComplete && setPage(idx)}
                disabled={!isComplete}
              >
                {isComplete ? (
                  <span className="tw-flex tw-items-center tw-justify-center tw-size-9 tw-rounded-full tw-bg-indigo-600 group-hover:tw-bg-indigo-700 tw-transition-colors">
                    <CheckIcon className="tw-size-5 tw-text-white" />
                  </span>
                ) : (
                  <span
                    className={`tw-flex tw-items-center tw-justify-center tw-size-9 tw-rounded-full tw-border-2 tw-text-sm tw-font-semibold tw-transition-colors ${
                      isCurrent
                        ? 'tw-border-indigo-600 tw-text-indigo-600'
                        : 'tw-border-gray-300 tw-text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                )}
                <span
                  className={`tw-text-sm tw-font-medium tw-whitespace-nowrap tw-transition-colors ${stepLabelColor(isCurrent, isComplete)}`}
                >
                  {label}
                </span>
              </button>

              {/* Connector line */}
              {idx < formContent.length - 1 && (
                <div className="tw-flex-1 tw-mx-1 tw-mb-5">
                  <div
                    className={`tw-h-0.5 tw-w-full ${
                      idx < page ? 'tw-bg-indigo-600' : 'tw-bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
