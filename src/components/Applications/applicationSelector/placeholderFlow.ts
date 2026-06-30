import type { ApplicationSelectorFlowDefinition, ApplicationSelectorOutcome } from './types';

const DIRECTIVE_COVERAGE_APPLICATION_ID = 'dc0f';

const stateImageUrl = (state: string): string => `/SelectApplicationForm/${state}.svg`;

export const applicationSelectorListIcon = stateImageUrl('pennsylvania');

const exactMatches = (birthState: string) => [
  { questionId: 'birthState', value: birthState },
];

const annotatedOutcome = (
  id: string,
  title: string,
  birthState: string,
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId: DIRECTIVE_COVERAGE_APPLICATION_ID,
  applicationLabel: 'Directive Coverage Test',
  uploadLabel: null,
  instructionsMarkdown: [
    '1. Start the application.',
    '2. Save the application when it is complete.',
  ].join('\n'),
  matches: exactMatches(birthState),
  includeComponents: [],
});

const uploadOutcome = (
  id: string,
  title: string,
  birthState: string,
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId: null,
  applicationLabel: null,
  uploadLabel: 'Upload PDF',
  instructionsMarkdown: '1. Upload the completed PDF.',
  matches: exactMatches(birthState),
  includeComponents: [],
});

export const placeholderApplicationSelectorFlow: ApplicationSelectorFlowDefinition = {
  id: 'application-selector-placeholder',
  title: 'Application Selector',
  description: '',
  questions: [
    {
      id: 'birthState',
      title: 'What state was the client born in?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [],
      includeComponents: [],
      options: [
        {
          value: 'PA',
          label: 'Pennsylvania',
          description: '',
          imageUrl: stateImageUrl('pennsylvania'),
        },
        {
          value: 'NJ',
          label: 'New Jersey',
          description: '',
          imageUrl: stateImageUrl('new-jersey'),
        },
        {
          value: 'NY',
          label: 'New York',
          description: '',
          imageUrl: stateImageUrl('new-york-state'),
        },
      ],
    },
    {
      id: 'renderingTest',
      title: 'Placeholder component',
      description: '',
      type: 'componentPage',
      answerSource: null,
      showWhen: [],
      includeComponents: ['blueBox'],
      options: [],
    },
  ],
  outcomes: [
    annotatedOutcome('pa-birth-certificate-annotated', 'Pennsylvania birth certificate', 'PA'),
    uploadOutcome('nj-birth-certificate-upload', 'New Jersey birth certificate', 'NJ'),
    uploadOutcome('ny-birth-certificate-upload', 'New York birth certificate', 'NY'),
  ],
};
