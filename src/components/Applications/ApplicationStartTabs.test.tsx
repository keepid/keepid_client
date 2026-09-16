/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadCaseSelector } from './applicationSelector/flowApi';
import ApplicationStartTabs from './ApplicationStartTabs';

vi.mock('./applicationSelector/flowApi', () => ({ loadCaseSelector: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadCaseSelector).mockResolvedValue({
    selectorId: 'picker',
    publishToken: 'published',
    title: 'Picker',
    rootNodeId: 'leaf',
    nodes: [{ id: 'leaf', outcomeId: 'outcome', type: 'OUTCOME', transitions: [] }],
    outcomes: [{ id: 'outcome',
      code: 'outcome',
      displayName: 'Replace ID',
      title: 'Replace ID',
      status: 'ACTIVE',
      fulfillmentMode: 'WEB_FORM',
      components: [] }],
  });
});
afterEach(cleanup);

const setup = (clientUsername?: string) => {
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <ApplicationStartTabs clientUsername={clientUsername} clientName="Demo Client">
        <a href="/applications/createnew">Legacy form</a>
      </ApplicationStartTabs>
    </Router>,
  );
  return history;
};

describe('application start tabs', () => {
  it('defaults to outcomes, searches them, and passes the selected client and published target', async () => {
    const history = setup('demo-client');
    expect(screen.getByRole('tab', { name: 'Outcome shortcuts' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('link', { name: 'Legacy form' })).not.toBeInTheDocument();
    await screen.findByRole('link', { name: 'Replace ID' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search outcomes' }), { target: { value: 'no match' } });
    expect(screen.getByText('No outcomes match your search.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search outcomes' }), { target: { value: 'replace' } });
    fireEvent.click(screen.getByRole('link', { name: 'Replace ID' }));
    expect(history.location).toMatchObject({ pathname: '/applications/selector',
      search: '?client=demo-client',
      state: {
        clientUsername: 'demo-client', clientName: 'Demo Client', outcomeShortcut: { nodeId: 'leaf', publishToken: 'published' },
      } });
  });

  it('shows outcomes without offering clientless navigation', async () => {
    setup();
    await screen.findByText('Replace ID');
    expect(screen.getByText('Open a client’s applications to use an outcome shortcut.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Replace ID' })).not.toBeInTheDocument();
  });

  it('can retry a failed load and return to the legacy list', async () => {
    vi.mocked(loadCaseSelector).mockRejectedValueOnce(new Error('Picker unavailable'));
    setup('demo-client');
    await screen.findByText('Picker unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('link', { name: 'Replace ID' });
    await waitFor(() => expect(loadCaseSelector).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('tab', { name: 'Application list' }));
    expect(screen.getByRole('link', { name: 'Legacy form' })).toBeInTheDocument();
  });
});
