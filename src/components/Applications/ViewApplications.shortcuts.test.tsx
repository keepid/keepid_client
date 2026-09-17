/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import Role from '../../static/Role';
import { loadCaseSelector, resolveCaseOutcome } from './applicationSelector/flowApi';
import ViewApplications from './ViewApplications';

vi.mock('react-alert', () => ({ useAlert: () => ({ error: vi.fn() }) }));
vi.mock('./ApplicationPreviewRoute', () => ({ default: () => null }));
vi.mock('../Documents/DocumentsInlineUpload', () => ({ default: () => null }));
vi.mock('./applicationSelector/flowApi', () => ({ loadCaseSelector: vi.fn(), resolveCaseOutcome: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('ResizeObserver', class {
    observe = vi.fn();

    unobserve = vi.fn();

    disconnect = vi.fn();
  });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    status: 200,
    json: async () => (url.endsWith('/get-organization-members')
      ? { status: 'SUCCESS', people: [{ username: 'demo-client', firstName: 'Demo', lastName: 'Client' }] }
      : []),
  })));
  vi.mocked(loadCaseSelector).mockResolvedValue({
    selectorId: 'picker',
    publishToken: 'published',
    title: 'Application picker',
    rootNodeId: 'input',
    nodes: [
      { id: 'input',
        type: 'CHOICE',
        componentKey: 'text-input',
        responseKey: 'reference',
        question: 'Reference number',
        transitions: [{ id: 'next', key: 'continue', type: 'SUBMIT', label: 'Continue', childNodeId: 'leaf' }] },
      { id: 'leaf', type: 'OUTCOME', outcomeId: 'bc', transitions: [] },
    ],
    outcomes: [{ id: 'bc', code: 'bc', displayName: 'New outcome', shortLabel: 'PA Housed BC', title: 'PA Housed BC', status: 'ACTIVE', fulfillmentMode: 'WEB_FORM', components: [] }],
  });
  vi.mocked(resolveCaseOutcome).mockResolvedValue({
    outcomeId: 'bc',
    outcomeCode: 'bc',
    serviceTitle: 'PA Housed BC',
    workerInstructionsMarkdown: 'Review the birth certificate instructions.',
    clientSheetMarkdown: '',
    fulfillmentMode: 'WEB_FORM',
    registryEntryId: 'registry',
    registryApplicationId: 'form',
    components: [],
    proposedActions: [],
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const setup = (path: string) => {
  const history = createMemoryHistory({ initialEntries: [path] });
  render(<Router history={history}><ViewApplications username="demo-worker" name="Demo Worker" role={Role.Worker} organization="Team Keep" /></Router>);
  return history;
};

it('opens instructions from the organization list after choosing a client, without picker questions', async () => {
  const history = setup('/applications?view=all');
  fireEvent.click(await screen.findByRole('button', { name: 'PA Housed BC' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open worker instructions' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Client' }), { target: { value: 'Demo' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Demo Client' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open worker instructions' }));
  await screen.findByRole('heading', { name: 'Worker instructions' });
  expect(history.location.pathname).toBe('/applications/selector');
  expect(screen.queryByRole('textbox', { name: 'Reference number' })).not.toBeInTheDocument();
  expect(resolveCaseOutcome).toHaveBeenCalledWith({
    clientUsername: 'demo-client',
    publishToken: 'published',
    shortcutOutcomeNodeId: 'leaf',
    path: [{ nodeId: 'input', transitionKey: 'continue' }],
    responses: {},
  });
});

it('opens a client shortcut directly and supports reloading its URL', async () => {
  setup('/applications/selector?client=demo-client&outcomeNode=leaf&publishToken=published');
  await screen.findByRole('heading', { name: 'Worker instructions' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('Review the birth certificate instructions.')).toBeInTheDocument();
});
