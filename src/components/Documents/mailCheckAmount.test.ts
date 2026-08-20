import { describe, expect, it } from 'vitest';

import {
  checkAmountError,
  hasPositiveCheckAmount,
  normalizeCheckAmount,
} from './mailCheckAmount';

describe('mail check amounts', () => {
  it('accepts and normalizes Lob-supported amounts', () => {
    expect(checkAmountError('12.5')).toBeNull();
    expect(checkAmountError('999999.99')).toBeNull();
    expect(normalizeCheckAmount('12.5')).toBe('12.50');
  });

  it('rejects invalid, over-precise, and out-of-range values', () => {
    expect(checkAmountError('')).toMatch(/Enter/);
    expect(checkAmountError('12.345')).toMatch(/two decimal/);
    expect(checkAmountError('1000000')).toMatch(/999,999.99/);
    expect(checkAmountError('0')).toMatch(/greater/);
  });

  it('recognizes automatically configured positive amounts', () => {
    expect(hasPositiveCheckAmount('42.75')).toBe(true);
    expect(hasPositiveCheckAmount('0')).toBe(false);
    expect(hasPositiveCheckAmount('')).toBe(false);
  });
});
