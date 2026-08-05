import { describe, expect, it } from 'vitest';

import { smartTitleCase } from './textCase';

describe('smartTitleCase', () => {
  it('handles Mc names, apostrophes, hyphens, and curly apostrophes', () => {
    expect(smartTitleCase("mcpherson o'connor smith-jones children’s hospital"))
      .toBe("McPherson O'Connor Smith-Jones Children’s Hospital");
  });
});
