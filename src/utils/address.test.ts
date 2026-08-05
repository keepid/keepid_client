import { describe, expect, it } from 'vitest';

import { formatAddress, formatCityStateZip } from './address';

describe('address formatting', () => {
  it('keeps the state and ZIP together without an extra comma', () => {
    expect(formatCityStateZip({ city: 'Philadelphia', state: 'PA', zip: '19104' }))
      .toBe('Philadelphia, PA 19104');
    expect(formatAddress({
      line1: '123 Market St',
      line2: 'Apt 2',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19104',
    })).toBe('123 Market St, Apt 2, Philadelphia, PA 19104');
  });
});
