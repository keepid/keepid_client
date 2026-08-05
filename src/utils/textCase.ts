function capitalizeSegment(segment: string): string {
  const lower = segment.toLocaleLowerCase();
  const capitalized = lower.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase());
  return capitalized.replace(/^Mc(\p{L})/u, (_match, letter: string) => `Mc${letter.toLocaleUpperCase()}`);
}

export function smartTitleCase(value: string): string {
  return value.replace(/\p{L}[\p{L}'’.-]*/gu, (word) => (
    word
      .split(/(['’.-])/u)
      .map((segment, index, segments) => {
        if (index % 2 !== 0) return segment;
        const followsContractionApostrophe = index > 0
          && ["'", '’'].includes(segments[index - 1])
          && segments[0].length > 1;
        return followsContractionApostrophe ? segment.toLocaleLowerCase() : capitalizeSegment(segment);
      })
      .join('')
  ));
}
