import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';

import { capitalizeFirst } from '../Utils/StringUtils';
import { ApplicationFormData, formContent } from './Hooks/ApplicationFormHook';
import { getDisplayName } from './Utils/DisplayNameMappingUtil';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface ApplicationBreadCrumbsProps {
  page: number;
  setPage: (e: number) => void;
  data: ApplicationFormData;
}

export default function ApplicationBreadCrumbs({ page, setPage, data }: ApplicationBreadCrumbsProps) {
  const lastStepIdx = formContent.length - 1;

  return (
    <div className="lg:tw-border-b lg:tw-border-t lg:tw-border-gray-200 tw-px-0">
      <nav aria-label="Progress" className="tw-mx-auto tw-max-w-7xl tw-px-0">
        <ol
          className="tw-overflow-hidden tw-rounded-md lg:tw-flex lg:tw-rounded-none lg:tw-border-l lg:tw-border-r lg:tw-border-gray-200 tw-px-0"
        >
          {formContent.map((step, stepIdx) => (
            <li key={step.pageName} className="tw-relative tw-overflow-hidden lg:tw-flex-1">
              <div
                className={classNames(
                  stepIdx === 0 ? 'tw-rounded-t-md tw-border-b-0' : '',
                  stepIdx === lastStepIdx ? 'tw-rounded-b-md tw-border-t-0' : '',
                  'tw-overflow-hidden tw-border tw-border-gray-200 lg:tw-border-0',
                )}
              >
                {stepIdx < page && (
                  <a className="tw-group" onClick={(_) => { setPage(stepIdx); }}>
                    <span
                      aria-hidden="true"
                      className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-1 tw-bg-transparent group-hover:tw-bg-gray-200 lg:tw-bottom-0 lg:tw-top-auto lg:tw-h-1 lg:tw-w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:tw-pl-9' : '',
                        'tw-flex tw-items-start tw-px-6 tw-py-5 tw-text-sm tw-font-medium',
                      )}
                    >
                      <span className="shrink-0">
                        <span className="tw-flex tw-size-10 tw-items-center tw-justify-center tw-rounded-full tw-bg-indigo-600">
                          <CheckIcon aria-hidden="true" className="tw-size-6 tw-text-white" />
                        </span>
                      </span>
                      <span className="tw-ml-4 tw-mt-0.5 tw-flex tw-min-w-0 tw-flex-col resize-none">
                        <span className="tw-text-lg tw-font-medium">{capitalizeFirst(step.pageName)}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">
                          { step.dataAttr ? getDisplayName(data[step.dataAttr]) : 'Complete' }
                        </span>
                      </span>
                    </span>
                  </a>
                )}
                {page === stepIdx && (
                  <a aria-current="step">
                    <span
                      aria-hidden="true"
                      className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-1 tw-bg-indigo-600 lg:tw-bottom-0 lg:tw-top-auto lg:tw-h-1 lg:tw-w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:tw-pl-9' : '',
                        'tw-flex tw-items-start tw-px-6 tw-py-5 tw-text-sm tw-font-medium',
                      )}
                    >
                      <span className="tw-ml-4 tw-mt-0.5 tw-flex tw-min-w-0 tw-flex-col resize-none">
                        <span className="tw-text-lg tw-font-medium tw-text-indigo-600">{capitalizeFirst(step.pageName)}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">
                          { step.dataAttr ? getDisplayName(data[step.dataAttr]) : '' }
                        </span>
                      </span>
                    </span>
                  </a>
                )}
                {stepIdx > page && (
                  <a className="tw-group">
                    <span
                      aria-hidden="true"
                      className="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-1 tw-bg-transparent group-hover:tw-bg-gray-200 lg:tw-bottom-0 lg:tw-top-auto lg:tw-h-1 lg:tw-w-full"
                    />
                    <span
                      className={classNames(
                        stepIdx !== 0 ? 'lg:tw-pl-9' : '',
                        'tw-flex tw-items-start tw-px-6 tw-py-5 tw-text-sm tw-font-medium',
                      )}
                    >
                      <span className="tw-ml-4 tw-mt-0.5 tw-flex tw-min-w-0 tw-flex-col resize-none">
                        <span className="tw-text-lg tw-font-medium tw-text-gray-500">{capitalizeFirst(step.pageName)}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">
                          { step.dataAttr ? getDisplayName(data[step.dataAttr]) : '' }
                        </span>
                      </span>
                    </span>
                  </a>
                )}

                {stepIdx !== 0 ? (
                  <>
                    {/* Separator */}
                    <div aria-hidden="true" className="tw-absolute tw-inset-0 tw-left-0 tw-top-0 tw-hidden tw-w-3 lg:tw-block">
                      <svg
                        fill="none"
                        viewBox="0 0 12 82"
                        preserveAspectRatio="none"
                        className="tw-size-full tw-text-gray-300"
                      >
                        <path d="M0.5 0V31L10.5 41L0.5 51V82" stroke="currentcolor" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
