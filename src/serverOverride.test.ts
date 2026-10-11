import { afterEach, describe, expect, it, vi } from 'vitest';

import getServerURL from './serverOverride';

describe('getServerURL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the local server when no override is set', () => {
    vi.stubEnv('VITE_API_BASE', '');
    expect(getServerURL()).toBe('http://localhost:7001');
  });

  it('uses VITE_API_BASE in development', () => {
    vi.stubEnv('VITE_API_BASE', 'http://localhost:7501');
    expect(getServerURL()).toBe('http://localhost:7501');
  });
});
