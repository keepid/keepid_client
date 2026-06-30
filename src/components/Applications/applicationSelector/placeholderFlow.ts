import type { ApplicationSelectorFlowDefinition, ApplicationSelectorOutcome } from './types';

const DIRECTIVE_COVERAGE_APPLICATION_ID = 'dc0f';

const svgDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

const stateIcon = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#445FEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
`);

export const applicationSelectorListIcon = stateIcon;

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
  instructions: [
    'Start the application.',
    'Save the application when it is complete.',
  ],
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
  instructions: ['Upload the completed PDF.'],
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
      includeComponents: [],
      options: [
        {
          value: 'PA',
          label: 'Pennsylvania',
          description: '',
          iconSvgUrl: stateIcon,
        },
        {
          value: 'NJ',
          label: 'New Jersey',
          description: '',
          iconSvgUrl: stateIcon,
        },
        {
          value: 'NY',
          label: 'New York',
          description: '',
          iconSvgUrl: stateIcon,
        },
      ],
    },
    {
      id: 'renderingTest',
      title: 'Placeholder component',
      description: '',
      type: 'componentPage',
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
