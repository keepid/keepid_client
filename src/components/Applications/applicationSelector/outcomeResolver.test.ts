import { describe, expect, it } from 'vitest';

import { resolveApplicationSelectorOutcome } from './outcomeResolver';
import { placeholderApplicationSelectorFlow } from './placeholderFlow';

describe('application selector outcome resolver', () => {
  it('maps a complete answer set to one annotated-form outcome', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      documentGoal: 'birthCertificate',
      state: 'PA',
    })?.id).toBe('pa-birth-certificate-annotated');
  });

  it('maps a complete answer set to one upload-only outcome', () => {
    const outcome = resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      documentGoal: 'birthCertificate',
      state: 'NJ',
    });

    expect(outcome?.id).toBe('nj-birth-certificate-upload');
    expect(outcome?.applicationId).toBeNull();
  });

  it('does not resolve before all branching answers are present', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      documentGoal: 'stateId',
    })).toBeNull();
  });

  it('ignores component-only values when matching outcomes', () => {
    expect(resolveApplicationSelectorOutcome(placeholderApplicationSelectorFlow, {
      documentGoal: 'stateId',
      state: 'PA',
      clientNotebox: 'This component value is outside the branch logic.',
    })?.id).toBe('pa-state-id-annotated');
  });

  it('requires exact matches rather than priority fallback matches', () => {
    const flowWithBroadOutcomeFirst = {
      ...placeholderApplicationSelectorFlow,
      outcomes: [
        {
          ...placeholderApplicationSelectorFlow.outcomes[0],
          id: 'broad-pa-fallback',
          matches: [{ questionId: 'state', value: 'PA' }],
        },
        ...placeholderApplicationSelectorFlow.outcomes,
      ],
    };

    expect(resolveApplicationSelectorOutcome(flowWithBroadOutcomeFirst, {
      documentGoal: 'birthCertificate',
      state: 'PA',
    })?.id).toBe('pa-birth-certificate-annotated');
  });
});
