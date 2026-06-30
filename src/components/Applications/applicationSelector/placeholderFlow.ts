import type {
  ApplicationSelectorAnswerMatch,
  ApplicationSelectorFlowDefinition,
  ApplicationSelectorOutcome,
} from './types';

const SOCIAL_SECURITY_CARD_APPLICATION_ID = 'bba3';
const PA_HOMELESS_BIRTH_CERTIFICATE_APPLICATION_ID = '2e68';
const PENNDOT_PHOTO_ID_HOMELESS_LETTER_APPLICATION_ID = 'ccc6';
const PA_HOUSED_BIRTH_CERTIFICATE_APPLICATION_ID = '742e';

const assetImageUrl = (assetName: string): string => `/SelectApplicationForm/${assetName}.svg`;

export const applicationSelectorListIcon = assetImageUrl('pennsylvania');

const uploadInstructions = [
  '1. Look up the application PDF.',
  '2. Fill it out.',
  '3. Upload the completed PDF here.',
].join('\n');

const annotatedInstructions = (applicationLabel: string) => [
  `1. Start the ${applicationLabel} application.`,
  '2. Save the application when it is complete.',
].join('\n');

const pennDotLetterInstructions = [
  '1. Fill out the PennDOT Photo ID Homeless Letter.',
  '2. Print it out.',
  '3. Direct the client to the nearest PennDOT center.',
].join('\n');

const match = (questionId: string, value: string): ApplicationSelectorAnswerMatch => ({
  questionId,
  value,
});

const annotatedOutcome = (
  id: string,
  title: string,
  applicationId: string,
  applicationLabel: string,
  instructionsMarkdown: string,
  matches: ApplicationSelectorAnswerMatch[],
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId,
  applicationLabel,
  uploadLabel: null,
  instructionsMarkdown,
  matches,
  includeComponents: [],
});

const uploadOutcome = (
  id: string,
  title: string,
  matches: ApplicationSelectorAnswerMatch[],
): ApplicationSelectorOutcome => ({
  id,
  title,
  applicationId: null,
  applicationLabel: null,
  uploadLabel: 'Upload PDF',
  instructionsMarkdown: uploadInstructions,
  matches,
  includeComponents: [],
});

export const placeholderApplicationSelectorFlow: ApplicationSelectorFlowDefinition = {
  id: 'application-selector-placeholder',
  title: 'Application Selector',
  description: '',
  questions: [
    {
      id: 'idType',
      title: 'What type of ID does the client need?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [],
      includeComponents: [],
      options: [
        {
          value: 'birthCertificate',
          label: 'Birth Certificate',
          description: '',
          imageUrl: assetImageUrl('birth-cert'),
        },
        {
          value: 'photoId',
          label: 'Photo ID',
          description: '',
          imageUrl: assetImageUrl('drivers-license'),
        },
        {
          value: 'socialSecurityCard',
          label: 'Social Security Card',
          description: '',
          imageUrl: assetImageUrl('social-sec-card'),
        },
      ],
    },
    {
      id: 'birthState',
      title: 'What state was the client born in?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [match('idType', 'birthCertificate')],
      includeComponents: [],
      options: [
        {
          value: 'PA',
          label: 'Pennsylvania',
          description: '',
          imageUrl: assetImageUrl('pennsylvania'),
        },
        {
          value: 'NJ',
          label: 'New Jersey',
          description: '',
          imageUrl: assetImageUrl('new-jersey'),
        },
        {
          value: 'NY',
          label: 'New York',
          description: '',
          imageUrl: assetImageUrl('new-york-state'),
        },
      ],
    },
    {
      id: 'birthCertificateHomelessness',
      title: 'Is the client experiencing homelessness?',
      description: '',
      type: 'singleChoice',
      answerSource: {
        type: 'profile',
        field: 'client.experiencingHomelessness',
      },
      showWhen: [
        match('idType', 'birthCertificate'),
        match('birthState', 'PA'),
      ],
      includeComponents: [],
      options: [
        { value: 'true', label: 'Yes', description: '', imageUrl: null },
        { value: 'false', label: 'No', description: '', imageUrl: null },
      ],
    },
    {
      id: 'photoIdState',
      title: 'What state is the photo ID for?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [match('idType', 'photoId')],
      includeComponents: [],
      options: [
        {
          value: 'PA',
          label: 'Pennsylvania',
          description: '',
          imageUrl: assetImageUrl('pennsylvania'),
        },
        {
          value: 'NJ',
          label: 'New Jersey',
          description: '',
          imageUrl: assetImageUrl('new-jersey'),
        },
        {
          value: 'NY',
          label: 'New York',
          description: '',
          imageUrl: assetImageUrl('new-york-state'),
        },
      ],
    },
    {
      id: 'photoIdHomelessness',
      title: 'Is the client experiencing homelessness?',
      description: '',
      type: 'singleChoice',
      answerSource: {
        type: 'profile',
        field: 'client.experiencingHomelessness',
      },
      showWhen: [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
      ],
      includeComponents: [],
      options: [
        { value: 'true', label: 'Yes', description: '', imageUrl: null },
        { value: 'false', label: 'No', description: '', imageUrl: null },
      ],
    },
    {
      id: 'hadPreviousPaPhotoId',
      title: 'Did the client have a previous PA photo ID?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'true'),
      ],
      includeComponents: [],
      options: [
        { value: 'no', label: 'No', description: '', imageUrl: null },
        { value: 'yes', label: 'Yes', description: '', imageUrl: null },
      ],
    },
    {
      id: 'previousPaPhotoIdExpired',
      title: 'Has the previous PA photo ID expired?',
      description: '',
      type: 'singleChoice',
      answerSource: null,
      showWhen: [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'true'),
        match('hadPreviousPaPhotoId', 'yes'),
      ],
      includeComponents: [],
      options: [
        { value: 'yes', label: 'Yes', description: '', imageUrl: null },
        { value: 'no', label: 'No', description: '', imageUrl: null },
      ],
    },
  ],
  outcomes: [
    annotatedOutcome(
      'social-security-card',
      'Social Security Card',
      SOCIAL_SECURITY_CARD_APPLICATION_ID,
      'Social Security Card',
      annotatedInstructions('Social Security Card'),
      [match('idType', 'socialSecurityCard')],
    ),
    annotatedOutcome(
      'pa-homeless-birth-certificate',
      'PA Homeless Birth Certificate',
      PA_HOMELESS_BIRTH_CERTIFICATE_APPLICATION_ID,
      'PA Homeless Birth Certificate',
      annotatedInstructions('PA Homeless Birth Certificate'),
      [
        match('idType', 'birthCertificate'),
        match('birthState', 'PA'),
        match('birthCertificateHomelessness', 'true'),
      ],
    ),
    annotatedOutcome(
      'pa-housed-birth-certificate',
      'PA Housed Birth Certificate',
      PA_HOUSED_BIRTH_CERTIFICATE_APPLICATION_ID,
      'PA Housed Birth Certificate',
      annotatedInstructions('PA Housed Birth Certificate'),
      [
        match('idType', 'birthCertificate'),
        match('birthState', 'PA'),
        match('birthCertificateHomelessness', 'false'),
      ],
    ),
    uploadOutcome(
      'nj-birth-certificate-upload',
      'New Jersey birth certificate',
      [
        match('idType', 'birthCertificate'),
        match('birthState', 'NJ'),
      ],
    ),
    uploadOutcome(
      'ny-birth-certificate-upload',
      'New York birth certificate',
      [
        match('idType', 'birthCertificate'),
        match('birthState', 'NY'),
      ],
    ),
    annotatedOutcome(
      'penndot-photo-id-homeless-letter-no-previous-id',
      'PennDOT Photo ID Homeless Letter',
      PENNDOT_PHOTO_ID_HOMELESS_LETTER_APPLICATION_ID,
      'PennDOT Photo ID Homeless Letter',
      pennDotLetterInstructions,
      [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'true'),
        match('hadPreviousPaPhotoId', 'no'),
      ],
    ),
    annotatedOutcome(
      'penndot-photo-id-homeless-letter-expired-id',
      'PennDOT Photo ID Homeless Letter',
      PENNDOT_PHOTO_ID_HOMELESS_LETTER_APPLICATION_ID,
      'PennDOT Photo ID Homeless Letter',
      pennDotLetterInstructions,
      [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'true'),
        match('hadPreviousPaPhotoId', 'yes'),
        match('previousPaPhotoIdExpired', 'yes'),
      ],
    ),
    uploadOutcome(
      'pa-photo-id-current-upload',
      'Pennsylvania photo ID',
      [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'true'),
        match('hadPreviousPaPhotoId', 'yes'),
        match('previousPaPhotoIdExpired', 'no'),
      ],
    ),
    uploadOutcome(
      'pa-photo-id-housed-upload',
      'Pennsylvania photo ID',
      [
        match('idType', 'photoId'),
        match('photoIdState', 'PA'),
        match('photoIdHomelessness', 'false'),
      ],
    ),
    uploadOutcome(
      'nj-photo-id-upload',
      'New Jersey photo ID',
      [
        match('idType', 'photoId'),
        match('photoIdState', 'NJ'),
      ],
    ),
    uploadOutcome(
      'ny-photo-id-upload',
      'New York photo ID',
      [
        match('idType', 'photoId'),
        match('photoIdState', 'NY'),
      ],
    ),
  ],
};
