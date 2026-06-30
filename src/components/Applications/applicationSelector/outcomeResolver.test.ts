import { describe, expect, it } from 'vitest';

import {
  buildProfileAnswers,
  getNextRenderableStepIndex,
  getRenderableStepNumber,
} from './flowLogic';
import { resolveApplicationSelectorOutcome } from './outcomeResolver';
import { placeholderApplicationSelectorFlow } from './placeholderFlow';
import type { ApplicationSelectorFlowDefinition } from './types';

describe('application selector outcome resolver', () => {
  it('maps a complete answer set to one annotated-form outcome', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      birthState: 'PA',
    })?.id).toBe('pa-birth-certificate-annotated');
  });

  it('maps a complete answer set to one upload-only outcome', () => {
    const outcome = resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      birthState: 'NJ',
    });

    expect(outcome?.id).toBe('nj-birth-certificate-upload');
    expect(outcome?.applicationId).toBeNull();
  });

  it('does not resolve before all branching answers are present', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {})).toBeNull();
  });

  it('ignores component-only values when matching outcomes', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      birthState: 'PA',
      blueBox: 'This component value is outside the branch logic.',
    })?.id).toBe('pa-birth-certificate-annotated');
  });

  it('requires exact matches rather than priority fallback matches', () => {
    const flowWithBroadOutcomeFirst = {
      ...placeholderApplicationSelectorFlow,
      outcomes: [
        {
          ...placeholderApplicationSelectorFlow.outcomes[0],
          id: 'broad-pa-fallback',
          matches: [],
        },
        ...placeholderApplicationSelectorFlow.outcomes,
      ],
    };

    expect(resolveApplicationSelectorOutcome(flowWithBroadOutcomeFirst, {
      birthState: 'PA',
    })?.id).toBe('pa-birth-certificate-annotated');
  });

  it('only requires conditional answers when their showWhen checks match', () => {
    const conditionalFlow: ApplicationSelectorFlowDefinition = {
      ...placeholderApplicationSelectorFlow,
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
      ...placeholderApplicationSelectorFlow,
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
