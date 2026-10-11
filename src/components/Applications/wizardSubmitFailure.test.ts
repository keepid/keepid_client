import { describe, expect, it } from 'vitest';

import { describeWizardSubmitFailure, WIZARD_SUBMIT_FAILURE_MESSAGE } from './wizardSubmitFailure';

describe('describeWizardSubmitFailure', () => {
  it('keeps the server detail out of the friendly message', () => {
    const failure = describeWizardSubmitFailure(new Error('Could not run LibreOffice document conversion'));

    expect(failure.message).toBe(WIZARD_SUBMIT_FAILURE_MESSAGE);
    expect(failure.message).not.toContain('LibreOffice');
    expect(failure.detail).toBe('Could not run LibreOffice document conversion');
  });

  it('falls back to a generic detail when the error has no message', () => {
    expect(describeWizardSubmitFailure(undefined).detail).toBe('Unknown error');
    expect(describeWizardSubmitFailure(new Error('   ')).detail).toBe('Unknown error');
    expect(describeWizardSubmitFailure('plain string').detail).toBe('plain string');
  });
});
