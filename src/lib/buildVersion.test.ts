import { describe, expect, it } from 'vitest';

import { buildVersionLabel, isDifferentBuild } from './buildVersion';

describe('buildVersion', () => {
  it('uses a short build label while preserving the development label', () => {
    expect(buildVersionLabel('1234567890abcdef')).toBe('12345678');
    expect(buildVersionLabel('development')).toBe('development');
  });

  it('detects a newly deployed production build', () => {
    expect(isDifferentBuild('old-sha', 'new-sha')).toBe(true);
    expect(isDifferentBuild('same-sha', 'same-sha')).toBe(false);
  });

  it('does not reload local development sessions', () => {
    expect(isDifferentBuild('development', 'new-sha')).toBe(false);
  });
});
