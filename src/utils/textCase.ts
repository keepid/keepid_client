function capitalizeSegment(segment: string): string {
  const lower = segment.toLocaleLowerCase();
  const capitalized = lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase());
  return capitalized.replace(/^Mc(\p{L})/u, (_match, letter: string) => `Mc${letter.toLocaleUpperCase()}`);
}

export function smartTitleCase(value: string): string {
  // Match numeric ordinals before words so their suffix is not capitalized separately.
  return value.replace(/\d+(?:st|nd|rd|th)\b|\p{L}[\p{L}'’.-]*/giu, (word) => {
    if (/^\d/u.test(word)) return word.toLocaleLowerCase();
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
