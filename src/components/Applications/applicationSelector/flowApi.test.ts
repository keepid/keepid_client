import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applicationSelectorFlowDefinition,
  loadApplicationSelectorFlow,
} from './flowApi';
import type { ApplicationSelectorFlowDefinition } from './types';

vi.mock('../../../serverOverride', () => ({
  default: () => 'http://server.test',
}));

const remoteFlow: ApplicationSelectorFlowDefinition = {
  id: 'remote-selector',
  title: 'Remote Selector',
  description: '',
  questions: [],
  outcomes: [],
};

describe('loadApplicationSelectorFlow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the uploaded selector flow from the server', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => remoteFlow,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadApplicationSelectorFlow()).resolves.toEqual(remoteFlow);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://server.test/application-selector-flow',
      {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      },
    );
  });

  it('falls back to the bundled selector flow when the server flow is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 404,
    })));

    await expect(loadApplicationSelectorFlow()).resolves.toBe(applicationSelectorFlowDefinition);
  });

  it('falls back to the bundled selector flow when the server response is malformed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: 'SUCCESS' }),
    })));

    await expect(loadApplicationSelectorFlow()).resolves.toBe(applicationSelectorFlowDefinition);
  });
});
