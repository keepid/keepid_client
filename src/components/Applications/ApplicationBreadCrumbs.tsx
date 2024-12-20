import { CheckIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

const steps = [
  { id: 'type', name: 'Type' },
  { id: 'state', name: 'State' },
  { id: 'person', name: 'Person' },
  { id: 'situation', name: 'Situation' },
  { id: 'review', name: 'Review' },
  { id: 'preview', name: 'Preview' },
  { id: 'send', name: 'Submit' },
];

function toDescription(stepIdx, dataAttr) {
  if (stepIdx > 3) {
    return '';
  }
  switch (dataAttr) {
    case 'ss_card':
      return 'Social Security Card';
    case 'drivers_license':
      return "Driver's License";
    case 'birth_cert':
      return 'Birth Certificate';
    case 'voter_reg':
      return 'Voter Registration';
    case 'NJ':
      return 'New Jersey';
    case 'NY':
      return 'New York';
    case 'PA':
      return 'Pennsylvania';
    case 'FED':
      return 'Federal';
    case 'myself':
      return 'Myself';
    case 'mychild':
      return 'My Child';
    case 'myself_and_mychild':
      return 'Myself and my child(ren)';
    case 'initial':
      return 'Initial';
    case 'duplicate':
      return 'Duplicate';
    case 'birth_cert_standard':
      return 'Standard';
    case 'birth_cert_homeless':
      return 'Homeless';
    case 'birth_cert_juvenile':
      return 'Juvenile';
    case 'birth_cert_substance':
      return 'Substance Abuse';
    case 'renewal':
      return 'Renewal';
    case 'change_address':
      return 'Change of Address';
    default:
      return 'None';
  }
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ApplicationBreadCrumbs({ page, setPage, data }) {
  return (
    <div className="lg:tw-border-b lg:tw-border-t lg:tw-border-gray-200 tw-px-0">
      <nav aria-label="Progress" className="tw-mx-auto tw-max-w-7xl tw-px-0">
        <ol
          className="tw-overflow-hidden tw-rounded-md lg:tw-flex lg:tw-rounded-none lg:tw-border-l lg:tw-border-r lg:tw-border-gray-200 tw-px-0"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="tw-relative tw-overflow-hidden lg:tw-flex-1">
              <div
                className={classNames(
                  stepIdx === 0 ? 'tw-rounded-t-md tw-border-b-0' : '',
                  stepIdx === steps.length - 1 ? 'tw-rounded-b-md tw-border-t-0' : '',
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
                        <span className="tw-text-lg tw-font-medium">{step.name}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">{toDescription(stepIdx, data[step.id])}</span>
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
                        <span className="tw-text-lg tw-font-medium tw-text-indigo-600">{step.name}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">{toDescription(stepIdx, data[step.id])}</span>
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
                        <span className="tw-text-lg tw-font-medium tw-text-gray-500">{step.name}</span>
                        <span className="tw-text-sm tw-font-medium tw-text-gray-500">{toDescription(stepIdx, data[step.id])}</span>
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
