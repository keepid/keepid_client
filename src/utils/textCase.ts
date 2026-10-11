function capitalizeSegment(segment: string): string {
  const lower = segment.toLocaleLowerCase();
  const capitalized = lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase());
  return capitalized.replace(/^Mc(\p{L})/u, (_match, letter: string) => `Mc${letter.toLocaleUpperCase()}`);
}

// Uppercase tokens kept as typed: US state and territory codes, PO (box), compass points,
// roman numerals used as name suffixes, and USA. Title-casing would turn "PA" into "Pa".
const UPPERCASE_TOKENS = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC',
  'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'PR', 'GU', 'VI', 'AS', 'MP', 'PO', 'NW', 'SW', 'SE', 'II', 'III', 'IV', 'USA',
]);

export function smartTitleCase(value: string): string {
  // Match numeric ordinals before words so their suffix is not capitalized separately.
  return value.replace(/\d+(?:st|nd|rd|th)\b|\p{L}[\p{L}'’.-]*/giu, (word) => {
    if (/^\d/u.test(word)) return word.toLocaleLowerCase();
    if (UPPERCASE_TOKENS.has(word)) return word;
    return word
      .split(/(['’.-])/u)
      .map((segment, index, segments) => {
        if (index % 2 !== 0) return segment;
        const followsContractionApostrophe = index > 0
          && ["'", '’'].includes(segments[index - 1])
          && segments[index - 2].length > 1;
        return followsContractionApostrophe ? segment.toLocaleLowerCase() : capitalizeSegment(segment);
      })
      .join('');
  });
}
