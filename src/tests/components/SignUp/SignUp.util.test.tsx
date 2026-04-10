import {
  birthDateStringConverter,
  birthDateStringFromIsoDateOnly,
  formatUrl,
  localDateFromIsoDateOnly,
} from '../../../components/SignUp/SignUp.util';

describe('SignUp.Util test', () => {
  describe('formatUrl', () => {
    test('add http test', () => {
      expect(formatUrl('https://example.com')).toBe('https://example.com');
      expect(formatUrl('https://www.example.com')).toBe(
        'https://www.example.com',
      );
      expect(formatUrl('www.example.org/somethinghere')).toBe(
        'http://www.example.org/somethinghere',
      );
    });
  });

  describe('test birth date string converter function', () => {
    test('JavaScript Date Object should turn into mm-dd-yyyy equivalent', () => {
      const firstDate = new Date('February 19, 2021');
      const formattedDate = birthDateStringConverter(firstDate);
      expect(formattedDate).toBe('02-19-2021');
    });
  });

  describe('localDateFromIsoDateOnly', () => {
    test('parses strict YYYY-MM-DD as local calendar components', () => {
      const d = localDateFromIsoDateOnly('2000-06-11');
      expect(d).toBeDefined();
      expect(d!.getFullYear()).toBe(2000);
      expect(d!.getMonth()).toBe(5);
      expect(d!.getDate()).toBe(11);
    });

    test('trims whitespace', () => {
      const d = localDateFromIsoDateOnly('  2000-06-11  ');
      expect(d).toBeDefined();
      expect(d!.getFullYear()).toBe(2000);
      expect(d!.getMonth()).toBe(5);
      expect(d!.getDate()).toBe(11);
    });

    test('returns undefined for empty, non-matching, or non-padded dates', () => {
      expect(localDateFromIsoDateOnly('')).toBeUndefined();
      expect(localDateFromIsoDateOnly('not-a-date')).toBeUndefined();
      expect(localDateFromIsoDateOnly('2000-1-05')).toBeUndefined();
      expect(localDateFromIsoDateOnly('2000-01-5')).toBeUndefined();
    });

    test('returns undefined for impossible calendar dates', () => {
      expect(localDateFromIsoDateOnly('2000-13-01')).toBeUndefined();
      expect(localDateFromIsoDateOnly('2000-01-40')).toBeUndefined();
      expect(localDateFromIsoDateOnly('2001-02-29')).toBeUndefined();
    });
  });

  describe('birthDateStringFromIsoDateOnly', () => {
    test('formats HTML date value to MM-dd-yyyy independent of process timezone', () => {
      expect(birthDateStringFromIsoDateOnly('2000-06-11')).toBe('06-11-2000');
      expect(birthDateStringFromIsoDateOnly('2000-01-05')).toBe('01-05-2000');
    });

    test('returns undefined for invalid input', () => {
      expect(birthDateStringFromIsoDateOnly('')).toBeUndefined();
      expect(birthDateStringFromIsoDateOnly('2000-13-40')).toBeUndefined();
    });

    // HTML date inputs yield YYYY-MM-DD; do not chain new Date(thatString) into birthDateStringConverter
    // (ECMAScript parses date-only strings as UTC midnight, which shifts the local calendar day).
    test('ISO path matches local y/m/d construction (regression guard)', () => {
      const fromIsoHelper = birthDateStringFromIsoDateOnly('2000-06-11');
      const fromLocalCtor = birthDateStringConverter(new Date(2000, 5, 11));
      expect(fromIsoHelper).toBe(fromLocalCtor);
    });
  });
});
