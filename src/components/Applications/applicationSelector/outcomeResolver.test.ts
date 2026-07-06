import { describe, expect, it } from 'vitest';

import applicationSelectorFlowData from './applicationSelectorFlow.json';
import {
  buildProfileAnswers,
  getNextRenderableStepIndex,
  getRenderableStepNumber,
} from './flowLogic';
import { resolveApplicationSelectorOutcome } from './outcomeResolver';
import type { ApplicationSelectorFlowDefinition } from './types';

const applicationSelectorFlow = applicationSelectorFlowData as ApplicationSelectorFlowDefinition;

describe('application selector outcome resolver', () => {
  it('maps social security card to the seeded annotated application', () => {
    const outcome = resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'socialSecurityCard',
    });

    expect(outcome?.id).toBe('social-security-card');
    expect(outcome?.applicationId).toBeTruthy();
  });

  it('maps Pennsylvania homeless birth certificate to the seeded annotated application', () => {
    const outcome = resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'birthCertificate',
      birthState: 'PA',
      birthCertificateHomelessness: 'true',
    });

    expect(outcome?.id).toBe('pa-homeless-birth-certificate');
    expect(outcome?.applicationId).toBeTruthy();
  });

  it('maps Pennsylvania housed birth certificate to the seeded annotated application', () => {
    const outcome = resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'birthCertificate',
      birthState: 'PA',
      birthCertificateHomelessness: 'false',
    });

    expect(outcome?.id).toBe('pa-housed-birth-certificate');
    expect(outcome?.applicationId).toBeTruthy();
  });

  it('maps a complete answer set to one upload-only outcome', () => {
    const outcome = resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'birthCertificate',
      birthState: 'NJ',
    });

    expect(outcome?.id).toBe('nj-birth-certificate-upload');
    expect(outcome?.applicationId).toBeNull();
  });

  it('maps qualifying Pennsylvania photo ID paths to the PennDOT letter application', () => {
    expect(resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'photoId',
      photoIdState: 'PA',
      photoIdHomelessness: 'true',
      hadPreviousPaPhotoId: 'no',
    })?.id).toBe('penndot-photo-id-homeless-letter-no-previous-id');

    expect(resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'photoId',
      photoIdState: 'PA',
      photoIdHomelessness: 'true',
      hadPreviousPaPhotoId: 'yes',
      previousPaPhotoIdExpired: 'yes',
    })?.id).toBe('penndot-photo-id-homeless-letter-expired-id');
  });

  it('does not resolve before all branching answers are present', () => {
    expect(resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'birthCertificate',
      birthState: 'PA',
    })).toBeNull();
  });

  it('ignores non-question values when matching outcomes', () => {
    expect(resolveApplicationSelectorOutcome(applicationSelectorFlow, {
      idType: 'birthCertificate',
      birthState: 'PA',
      birthCertificateHomelessness: 'true',
      blueBox: 'This component value is outside the branch logic.',
    })?.id).toBe('pa-homeless-birth-certificate');
  });

  it('requires exact matches rather than priority fallback matches', () => {
    const flowWithBroadOutcomeFirst = {
      ...applicationSelectorFlow,
      outcomes: [
        {
          ...applicationSelectorFlow.outcomes[0],
          id: 'broad-pa-fallback',
          matches: [],
        },
        ...applicationSelectorFlow.outcomes,
      ],
    };

    expect(resolveApplicationSelectorOutcome(flowWithBroadOutcomeFirst, {
      idType: 'birthCertificate',
      birthState: 'PA',
      birthCertificateHomelessness: 'true',
    })?.id).toBe('pa-homeless-birth-certificate');
  });

  it('only requires conditional answers when their showWhen checks match', () => {
    const conditionalFlow: ApplicationSelectorFlowDefinition = {
      ...applicationSelectorFlow,
      questions: [
        {
          id: 'birthState',
          title: 'Birth state',
          description: '',
          type: 'singleChoice',
          answerSource: null,
          showWhen: [],
          includeComponents: [],
          options: [
            { value: 'PA', label: 'Pennsylvania' },
          ],
        },
        {
          id: 'hasShelterLetter',
          title: 'Does the client have a shelter letter?',
          description: '',
          type: 'singleChoice',
          answerSource: null,
          showWhen: [{ questionId: 'birthState', value: 'PA' }],
          includeComponents: [],
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ],
        },
      ],
      outcomes: [
        {
          id: 'pa-with-letter',
          title: 'PA with shelter letter',
          applicationId: 'dc0f',
          applicationLabel: 'Directive Coverage Test',
          uploadLabel: null,
          instructionsMarkdown: '1. Start the application.',
          matches: [
            { questionId: 'birthState', value: 'PA' },
            { questionId: 'hasShelterLetter', value: 'yes' },
          ],
          includeComponents: [],
        },
      ],
    };

    expect(resolveApplicationSelectorOutcome(conditionalFlow, {
      birthState: 'PA',
    })).toBeNull();

    expect(resolveApplicationSelectorOutcome(conditionalFlow, {
      birthState: 'PA',
      hasShelterLetter: 'yes',
    })?.id).toBe('pa-with-letter');
  });

  it('uses profile answer sources as hidden answers', () => {
    const profileFlow: ApplicationSelectorFlowDefinition = {
      ...applicationSelectorFlow,
      questions: [
        {
          id: 'experiencingHomelessness',
          title: 'Are you experiencing homelessness?',
          description: '',
          type: 'singleChoice',
          answerSource: {
            type: 'profile',
            field: 'client.experiencingHomelessness',
          },
          showWhen: [],
          includeComponents: [],
          options: [
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ],
        },
        {
          id: 'birthState',
          title: 'Birth state',
          description: '',
          type: 'singleChoice',
          answerSource: null,
          showWhen: [],
          includeComponents: [],
          options: [
            { value: 'PA', label: 'Pennsylvania' },
          ],
        },
      ],
    };

    const profileAnswers = buildProfileAnswers(profileFlow, {
      client: {
        experiencingHomelessness: true,
      },
    });

    expect(profileAnswers).toEqual({ experiencingHomelessness: 'true' });
    expect(getNextRenderableStepIndex(profileFlow, profileAnswers, 0, profileAnswers)).toBe(1);
    expect(getRenderableStepNumber(profileFlow, profileAnswers, 1, profileAnswers)).toBe(1);
    expect(getRenderableStepNumber(profileFlow, {
      ...profileAnswers,
      birthState: 'PA',
    }, profileFlow.questions.length, profileAnswers)).toBe(2);
  });
});
