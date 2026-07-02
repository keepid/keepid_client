import { describe, expect, it } from 'vitest';

import { getClientSearchCandidateQueries, matchesClientSearchQuery } from './clientSearch';

describe('clientSearch', () => {
  it('matches clients when the query contains a first and last name', () => {
    expect(matchesClientSearchQuery({
      username: 'internal-123',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.org',
    }, 'Ada Lovelace')).toBe(true);
  });

  it('matches names even when the entered name order is reversed', () => {
    expect(matchesClientSearchQuery({
      username: 'internal-123',
      firstName: 'Ada',
      lastName: 'Lovelace',
    }, 'lovelace ada')).toBe(true);
  });

  it('builds candidate server queries from the full query and name tokens', () => {
    expect(getClientSearchCandidateQueries('  Ada   Lovelace  ')).toEqual([
      'Ada Lovelace',
      'Ada',
      'Lovelace',
    ]);
  });

  it('can include an empty search for landing pages that load all clients', () => {
    expect(getClientSearchCandidateQueries('   ', true)).toEqual(['']);
  });
});
