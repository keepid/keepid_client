import { describe, expect, it } from 'vitest';

import { smartTitleCase } from './textCase';

describe('smartTitleCase', () => {
  it.each([
    ['123 5th street, 2nd floor', '123 5th Street, 2nd Floor'],
    ['1ST 2ND 3RD 4TH 11TH 12TH 13TH 21ST 22ND 23RD 101ST',
      '1st 2nd 3rd 4th 11th 12th 13th 21st 22nd 23rd 101st'],
    ['east 21St st. (3rD floor)', 'East 21st St. (3rd Floor)'],
    ['5th-avenue children’s hospital', '5th-Avenue Children’s Hospital'],
  ])('preserves lowercase ordinal suffixes in %s', (input, expected) => {
    expect(smartTitleCase(input)).toBe(expected);
  });

  it('handles Mc names, apostrophes, hyphens, and curly apostrophes', () => {
    expect(smartTitleCase("mcpherson o'connor smith-jones children’s hospital"))
      .toBe("McPherson O'Connor Smith-Jones Children’s Hospital");
  });
});
