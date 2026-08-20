import { describe, expect, it } from 'vitest';

import {
  getApplicationMailDetailLabel,
  getApplicationMailTableLabel,
} from './applicationMailStatus';

describe('application mail status labels', () => {
  it('uses concise table labels for signing and mailing states', () => {
    expect(getApplicationMailTableLabel('AWAITING_SIGNATURE')).toBe('Awaiting signature');
    expect(getApplicationMailTableLabel('READY_TO_MAIL')).toBe('Ready to mail');
    expect(getApplicationMailTableLabel('NOT_MAILED')).toBe('Ready to mail');
    expect(getApplicationMailTableLabel('MAILED_WITH_LOB')).toBe('Mailed with Lob');
    expect(getApplicationMailTableLabel('MAILED_MANUALLY')).toBe('Printed then mailed');
  });

  it('includes the method and date in application details', () => {
    expect(getApplicationMailDetailLabel({
      mailStatus: 'MAILED_WITH_LOB',
      mailedAt: '2026-08-13T12:00:00Z',
    })).toBe('Mailed with Lob on Aug 13, 2026');
    expect(getApplicationMailDetailLabel({
      mailStatus: 'MAILED_MANUALLY',
      mailedAt: '2026-08-13T12:00:00Z',
    })).toBe('Mailed manually on Aug 13, 2026');
  });
});
