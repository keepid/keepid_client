import { Dialog } from '@headlessui/react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

const SOURCE_URL =
  'https://www.pa.gov/content/dam/copapwp-pagov/en/penndot/documents/public/dvspubsforms/bdl/bdl-fact-sheets/fs-homelessid.pdf';

const SECTIONS = [
  {
    title: 'Experiencing housing instability / unsheltered / or living in a shelter',
    criteria: [
      { text: 'The client does not have a fixed, regular, and adequate place to sleep at night.' },
      { text: 'They are sleeping somewhere not normally used as housing, such as a car, park, abandoned building, bus or train station, airport, or campground.' },
      { text: 'They are staying in a supervised temporary shelter, transitional housing, or a hotel or motel paid for by a charitable organization or government program.' },
    ],
  },
  {
    title: 'Recently experienced homelessness or is at risk of homelessness soon',
    criteria: [
      { text: 'The client previously stayed in a shelter or place not meant for people to live, and is now leaving an institution where they were temporarily staying.' },
      {
        text: 'They will lose housing soon, do not have another place lined up, and do not have the resources or support network needed to get permanent housing.',
        detailIntro: 'Imminent loss can include:',
        details: [
          'A court order evicting them within 14 days.',
          'A hotel or motel room they cannot afford to keep for more than 14 days.',
          'Credible evidence that the owner or renter will not allow them to stay for more than 14 days.',
          'A credible oral statement from the applicant.',
        ],
      },
    ],
  },
  {
    title: 'Unaccompanied youth (24 and under) or family experiencing homelessness',
    criteria: [{
      text: 'The client is an unaccompanied youth, or is part of a family with children or youth, and has not been able to live independently in permanent housing for a long period of time.',
      detailIntro: 'This can apply when they have also:',
      details: [
        'Moved frequently during that period.',
        'Expected the instability to continue because of chronic disabilities, chronic physical or mental health conditions, addiction, domestic violence or childhood abuse, a child with a disability, or multiple barriers to employment.',
      ],
    }],
  },
  {
    title: 'Fleeing domestic violence or dangerous conditions',
    criteria: [{
      text: 'The client is fleeing, or trying to flee, domestic or dating violence, sexual assault, stalking, or another dangerous or life-threatening condition for them or for children in their current housing situation.',
      detailIntro: 'This applies when they also:',
      details: [
        'Do not have another residence.',
        'Do not have the resources or support network needed to obtain permanent housing.',
      ],
    }],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HomelessnessDefinitionModal = ({ isOpen, onClose }: Props): JSX.Element => (
  <Dialog open={isOpen} onClose={onClose} className="tw-relative tw-z-[100]">
    <div className="tw-fixed tw-inset-0 tw-bg-black/40" aria-hidden="true" onMouseDown={onClose} />
    <div className="tw-fixed tw-inset-0 tw-overflow-y-auto tw-p-4 sm:tw-p-6">
      <div
        className="tw-flex tw-min-h-full tw-items-center tw-justify-center"
        onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      >
        <Dialog.Panel
          className="tw-flex tw-w-full tw-max-w-2xl tw-flex-col tw-overflow-hidden tw-rounded-lg tw-bg-white tw-shadow-xl"
          style={{ maxHeight: 'min(760px, calc(100vh - 2rem))' }}
        >
          <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-border-b tw-border-gray-200 tw-px-4 tw-py-3 sm:tw-px-5">
            <Dialog.Title className="tw-text-base tw-font-semibold tw-text-gray-900">Homelessness definition</Dialog.Title>
            <button
              type="button"
              aria-label="Close homelessness definition"
              className="tw-flex tw-h-8 tw-w-8 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-md tw-border-0 tw-bg-transparent tw-text-gray-500 hover:tw-bg-gray-100 hover:tw-text-gray-700"
              onClick={onClose}
            >
              <XMarkIcon className="tw-h-5 tw-w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="tw-min-h-0 tw-space-y-2 tw-overflow-y-auto tw-px-4 tw-py-3 sm:tw-px-5">
            {SECTIONS.map((section) => (
              <details key={section.title} className="tw-group tw-overflow-hidden tw-rounded-md tw-border tw-border-gray-200 tw-bg-white">
                <summary className="tw-flex tw-cursor-pointer tw-list-none tw-items-center tw-justify-between tw-gap-3 tw-px-4 tw-py-3 tw-text-sm tw-text-gray-900 [&::-webkit-details-marker]:tw-hidden">
                  <span className="tw-min-w-0 tw-font-semibold tw-leading-5">{section.title}</span>
                  <ChevronDownIcon className="tw-h-4 tw-w-4 tw-shrink-0 tw-text-gray-500 tw-transition-transform group-open:tw-rotate-180" aria-hidden="true" />
                </summary>
                <div className="tw-border-t tw-border-gray-100 tw-bg-gray-50 tw-px-4 tw-py-3">
                  <div className="tw-space-y-3 tw-rounded-md tw-bg-white tw-px-3 tw-py-3 tw-ring-1 tw-ring-gray-200">
                    {section.criteria.map((criterion) => (
                      <div key={criterion.text} className="tw-space-y-1.5">
                        <p className="tw-text-sm tw-leading-6 tw-text-gray-800">{criterion.text}</p>
                        {criterion.details && (
                          <div className="tw-space-y-1">
                            {criterion.detailIntro && <p className="tw-text-sm tw-font-medium tw-text-gray-700">{criterion.detailIntro}</p>}
                            <p className="tw-text-sm tw-leading-6 tw-text-gray-700">{criterion.details.join(' ')}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
            <p className="tw-border-t tw-border-gray-200 tw-pt-3 tw-text-xs tw-leading-5 tw-text-gray-600">
              Federal McKinney-Vento / Pennsylvania Definition of Homelessness:{' '}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="tw-font-medium tw-text-blue-600 tw-underline">PennDOT fact sheet</a>
            </p>
          </div>
          <div className="tw-flex tw-justify-end tw-border-t tw-border-gray-200 tw-px-4 tw-py-3 sm:tw-px-5">
            <button type="button" className="tw-rounded-md tw-border-0 tw-bg-twprimary tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white hover:tw-bg-blue-700" onClick={onClose}>Close</button>
          </div>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
);

export default HomelessnessDefinitionModal;
