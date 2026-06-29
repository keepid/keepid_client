import type { ApplicationSelectorFlowDefinition, ApplicationSelectorOutcome } from './types';

const DIRECTIVE_COVERAGE_APPLICATION_ID = 'dc0f';

const svgDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

const certificateIcon = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#445FEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
`);

const idCardIcon = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#445FEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M14 10h4M14 14h3M7 16c.7-1.3 3.3-1.3 4 0"/></svg>
`);

const uploadIcon = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#445FEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5a2 2 0 0 0 2 2h5"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M12 17v-6M9 14l3-3 3 3"/></svg>
`);

const stateIcon = svgDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#445FEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
`);

export const applicationSelectorListIcon = certificateIcon;

const exactMatches = (documentGoal: string, state: string) => [
  { questionId: 'documentGoal', value: documentGoal },
  { questionId: 'state', value: state },
];

const annotatedOutcome = (
  id: string,
  title: string,
  documentGoal: string,
  state: string,
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId: DIRECTIVE_COVERAGE_APPLICATION_ID,
  applicationLabel: 'Directive Coverage Test',
  uploadLabel: null,
  instructions: [
    'Confirm the client details on the review page.',
    'Start the annotated form and complete any remaining visible questions.',
    'Save the application draft before mailing or downloading.',
  ],
  matches: exactMatches(documentGoal, state),
  includeComponents: [],
});

const uploadOutcome = (
  id: string,
  title: string,
  documentGoal: string,
  state: string,
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId: null,
  applicationLabel: null,
  uploadLabel: 'Upload PDF',
  instructions: [
    'Use the instructions collected by the application selector.',
    'Upload the completed PDF to create an ad hoc application record.',
    'Attach supporting files from the client document library when needed.',
  ],
  matches: exactMatches(documentGoal, state),
  includeComponents: [],
});

export const placeholderApplicationSelectorFlow: ApplicationSelectorFlowDefinition = {
  id: 'application-selector-placeholder',
  title: 'Application Selector',
  description: 'Staff-guided placeholder flow for choosing the next application path.',
  questions: [
    {
      id: 'documentGoal',
      title: 'What does the client need?',
      description: 'Choose the document or next step the client is trying to complete.',
      type: 'singleChoice',
      includeComponents: [],
      options: [
        {
          value: 'birthCertificate',
          label: 'Birth certificate',
          description: 'Use an annotated form when a state-specific template is available.',
          iconSvgUrl: certificateIcon,
        },
        {
          value: 'stateId',
          label: 'State ID',
          description: 'Route to an ID application when the registry supports it.',
          iconSvgUrl: idCardIcon,
        },
        {
          value: 'other',
          label: 'Something else',
          description: 'Show instructions and collect a PDF when there is no annotated form.',
          iconSvgUrl: uploadIcon,
        },
      ],
    },
    {
      id: 'state',
      title: 'Select the state',
      description: 'This placeholder uses exact state answers to choose an outcome.',
      type: 'singleChoice',
      includeComponents: [],
      options: [
        {
          value: 'PA',
          label: 'Pennsylvania',
          description: 'Use the Pennsylvania placeholder branch.',
          iconSvgUrl: stateIcon,
        },
        {
          value: 'NJ',
          label: 'New Jersey',
          description: 'Use the upload-only placeholder branch.',
          iconSvgUrl: stateIcon,
        },
        {
          value: 'NY',
          label: 'New York',
          description: 'Use the upload-only placeholder branch.',
          iconSvgUrl: stateIcon,
        },
      ],
    },
    {
      id: 'profileReview',
      title: 'Review client context',
      description: 'This page demonstrates component boxes that do not participate in branching.',
      type: 'componentPage',
      includeComponents: ['clientNotebox'],
      options: [],
    },
  ],
  outcomes: [
    annotatedOutcome('pa-birth-certificate-annotated', 'Birth certificate packet', 'birthCertificate', 'PA'),
    annotatedOutcome('pa-state-id-annotated', 'State ID packet', 'stateId', 'PA'),
    uploadOutcome('pa-other-upload', 'Upload supporting PDF', 'other', 'PA'),
    uploadOutcome('nj-birth-certificate-upload', 'Upload New Jersey PDF', 'birthCertificate', 'NJ'),
    uploadOutcome('nj-state-id-upload', 'Upload New Jersey ID PDF', 'stateId', 'NJ'),
    uploadOutcome('nj-other-upload', 'Upload New Jersey supporting PDF', 'other', 'NJ'),
    uploadOutcome('ny-birth-certificate-upload', 'Upload New York PDF', 'birthCertificate', 'NY'),
    uploadOutcome('ny-state-id-upload', 'Upload New York ID PDF', 'stateId', 'NY'),
    uploadOutcome('ny-other-upload', 'Upload New York supporting PDF', 'other', 'NY'),
  ],
};
