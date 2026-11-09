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

it('filters mail work by readiness and preserves print and record statuses', async () => {
  const records = [
    { id: 'ready', applicationName: 'Ready letter', state: 'READY_TO_MAIL', deliveryMode: 'MAIL', mailStatus: 'READY_TO_MAIL' },
    { id: 'signed', applicationName: 'Signature letter', state: 'AWAITING_SIGNATURE', deliveryMode: 'MAIL', mailStatus: 'AWAITING_SIGNATURE' },
    { id: 'sent', applicationName: 'Sent letter', state: 'MAILED', deliveryMode: 'MAIL', mailStatus: 'MAILED_WITH_LOB' },
    { id: 'draft', applicationName: 'Draft letter', state: 'DRAFT', deliveryMode: 'MAIL', mailStatus: 'DRAFT' },
    { id: 'print', applicationName: 'Client instructions', state: 'READY_TO_PRINT', deliveryMode: 'PRINT_ONLY', mailStatus: 'NOT_APPLICABLE' },
    { id: 'record', applicationName: 'Intake record', state: 'RECORDED', deliveryMode: 'RECORD_ONLY', mailStatus: 'NOT_APPLICABLE' },
  ];
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => (url.endsWith('/list-applications') ? records : []),
  })));
  setup('/applications?view=all');
  await screen.findByText('Ready letter');
  expect(screen.getByText('Ready to print')).toBeInTheDocument();
  expect(screen.getByText('Saved for records')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Document outcome'), { target: { value: 'MAIL' } });
  expect(screen.queryByText('Client instructions')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Mailing status'), { target: { value: 'NEEDS_MAILING' } });
  expect(screen.getByText('Ready letter')).toBeInTheDocument();
  ['Signature letter', 'Sent letter', 'Draft letter', 'Intake record'].forEach((name) => {
    expect(screen.queryByText(name)).not.toBeInTheDocument();
  });
  fireEvent.change(screen.getByLabelText('Mailing status'), { target: { value: 'MAILED' } });
  expect(screen.getByText('Sent letter')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Document outcome'), { target: { value: 'PRINT_ONLY' } });
  expect(screen.getByText('Client instructions')).toBeInTheDocument();
  expect(screen.queryByLabelText('Mailing status')).not.toBeInTheDocument();
});
