/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApplicationSelectorFlow from './ApplicationSelectorFlow';
import { completeServiceRecord, createClassifiedService, loadCaseSelector, resolveCaseOutcome } from './flowApi';
import type { SelectorFlow } from './types';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('react-router-dom', () => ({ useHistory: () => ({ push }) }));
vi.mock('react-alert', () => ({ useAlert: () => ({ error: vi.fn() }) }));
vi.mock('../../Documents/DocumentsInlineUpload', () => ({ default: () => null }));
vi.mock('./flowApi', () => ({
  loadCaseSelector: vi.fn(),
  resolveCaseOutcome: vi.fn(),
  createClassifiedService: vi.fn(),
  completeServiceRecord: vi.fn(),
  loadClientLoginDetails: vi.fn(),
  loadPennDotNumber: vi.fn(),
  savePennDotNumber: vi.fn(),
  previewManualService: vi.fn(),
  createManualService: vi.fn(),
  uploadServicePdf: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loadCaseSelector).mockResolvedValue({
    selectorId: 'selector',
    publishToken: 'token',
    title: 'ID help',
    rootNodeId: 'leaf',
    nodes: [{ id: 'leaf', type: 'OUTCOME', outcomeId: 'outcome', transitions: [] }],
    outcomes: [],
  });
  vi.mocked(resolveCaseOutcome).mockResolvedValue({
    outcomeId: 'outcome',
    outcomeCode: 'attachments',
    serviceTitle: 'ID letter',
    workerInstructionsMarkdown: 'Review the letter with the client.',
    clientSheetMarkdown: '',
    fulfillmentMode: 'ATTACHMENTS_ONLY',
    components: [],
    proposedActions: [],
  });
  vi.mocked(createClassifiedService).mockResolvedValue({
    applicationId: 'packet',
    serviceRecordId: 'packet',
    classificationStatus: 'CLASSIFIED',
    fulfillmentMode: 'ATTACHMENTS_ONLY',
    serviceTitle: 'ID letter',
  });
  vi.mocked(completeServiceRecord).mockResolvedValue(undefined);
});

const shortcutFlow: SelectorFlow = {
  selectorId: 'selector',
  publishToken: 'token',
  title: 'ID help',
  rootNodeId: 'root',
  nodes: [
    { id: 'root',
      type: 'CHOICE',
      question: 'Which document?',
      transitions: [
        { id: 'choose', key: 'letter', type: 'CHOICE', label: 'ID letter', childNodeId: 'details' },
      ] },
    { id: 'details',
      type: 'CHOICE',
      question: 'Reference number',
      componentKey: 'text-input',
      responseKey: 'reference',
      componentConfig: { label: 'Reference number' },
      transitions: [
        { id: 'submit', key: 'continue', type: 'SUBMIT', label: 'Continue', childNodeId: 'leaf' },
      ] },
    { id: 'leaf', type: 'OUTCOME', outcomeId: 'outcome', transitions: [] },
  ],
  outcomes: [{ id: 'outcome',
    code: 'letter',
    displayName: 'ID letter',
    title: 'ID letter',
    status: 'ACTIVE',
    fulfillmentMode: 'ATTACHMENTS_ONLY',
    components: [] }],
};

describe('outcome shortcut navigation', () => {
  beforeEach(() => { vi.mocked(loadCaseSelector).mockResolvedValue(shortcutFlow); });

  it('jumps to a web-form outcome and hands off its classification and confirmed actions', async () => {
    vi.mocked(loadCaseSelector).mockResolvedValue({
      ...shortcutFlow,
      nodes: [
        { ...shortcutFlow.nodes[0], transitions: [{ id: 'direct', key: 'letter', type: 'CHOICE', label: 'ID letter', childNodeId: 'leaf' }] },
        shortcutFlow.nodes[2],
      ],
    });
    vi.mocked(resolveCaseOutcome).mockResolvedValue({
      outcomeId: 'outcome',
      outcomeCode: 'letter',
      serviceTitle: 'ID letter',
      workerInstructionsMarkdown: 'Review and complete the form.',
      clientSheetMarkdown: '',
      fulfillmentMode: 'WEB_FORM',
      registryEntryId: 'registry',
      registryApplicationId: 'form',
      components: [],
      proposedActions: [{ effectId: 'note', type: 'PROPOSE_CLIENT_NOTE', label: 'Add note', bodyMarkdown: 'Helped client.' }],
    });
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" initialShortcut={{ nodeId: 'leaf', publishToken: 'token' }} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Continue to application' }, { timeout: 5000 }));
    expect(push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/applications/createnew',
      state: expect.objectContaining({
        clientUsername: 'demo-client',
        startAtWebForm: true,
        presetApplication: expect.objectContaining({ applicationId: 'form' }),
        selectorCompletion: expect.objectContaining({
          publishToken: 'token',
          shortcutOutcomeNodeId: 'leaf',
          path: [{ nodeId: 'root', transitionKey: 'letter' }],
          responses: {},
          confirmedEffectIds: ['note'],
        }),
      }),
    }));
    expect(createClassifiedService).not.toHaveBeenCalled();
  });

  it('opens worker instructions directly without collecting picker responses', async () => {
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" initialShortcut={{ nodeId: 'leaf', publishToken: 'token' }} />);
    await screen.findByRole('heading', { name: 'Worker instructions' });
    expect(screen.getByText('Review the letter with the client.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Reference number' })).not.toBeInTheDocument();
    expect(resolveCaseOutcome).toHaveBeenCalledWith({
      clientUsername: 'demo-client',
      publishToken: 'token',
      shortcutOutcomeNodeId: 'leaf',
      responses: {},
      path: [{ nodeId: 'root', transitionKey: 'letter' }, { nodeId: 'details', transitionKey: 'continue' }],
    });
    expect(createClassifiedService).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/applications' }));
  });

  it('still collects required responses when using the guided picker', async () => {
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" />);
    fireEvent.click(await screen.findByRole('button', { name: 'ID letter' }));
    await screen.findByRole('textbox', { name: 'Reference number' });
    expect(screen.queryByRole('heading', { name: 'Which document?' })).not.toBeInTheDocument();
    expect(resolveCaseOutcome).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Enter a value to continue.')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Reference number' }), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('button', { name: 'Create attachments and review' });
    const traversal = {
      clientUsername: 'demo-client',
      publishToken: 'token',
      responses: { reference: '1234' },
      path: [{ nodeId: 'root', transitionKey: 'letter' }, { nodeId: 'details', transitionKey: 'continue' }],
    };
    expect(resolveCaseOutcome).toHaveBeenCalledWith(traversal);
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(screen.getByRole('textbox', { name: 'Reference number' })).toHaveValue('');
    fireEvent.change(screen.getByRole('textbox', { name: 'Reference number' }), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Create attachments and review' }));
    await waitFor(() => expect(createClassifiedService).toHaveBeenCalledWith(expect.objectContaining(traversal)));
  });

  it('returns from worker instructions to shortcuts and can restart the full picker', async () => {
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" initialShortcut={{ nodeId: 'leaf', publishToken: 'token' }} />);
    await screen.findByRole('heading', { name: 'Worker instructions' });
    fireEvent.click(screen.getByRole('button', { name: 'Back', exact: true }));
    expect(push).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/applications', state: expect.objectContaining({ applicationTab: 'outcomes' }) }));
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByRole('heading', { name: 'Which document?' })).toBeInTheDocument();
    expect(screen.queryByText('Outcome shortcut: ID letter')).not.toBeInTheDocument();
  });

  it.each([
    { nodeId: 'leaf', publishToken: 'old-token' },
    { nodeId: 'removed', publishToken: 'token' },
  ])('does not resolve stale or missing shortcuts: %o', async (initialShortcut) => {
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" initialShortcut={initialShortcut} />);
    await screen.findByText(/This outcome shortcut has changed/);
    expect(resolveCaseOutcome).not.toHaveBeenCalled();
    expect(createClassifiedService).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByRole('heading', { name: 'Which document?' })).toBeInTheDocument();
  });
});
afterEach(cleanup);

describe('attachments-only selector outcomes', () => {
  it('creates and opens the packet without a form or upload', async () => {
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create attachments and review' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/applications/preview', state: expect.objectContaining({ applicationId: 'packet' }),
    })));
    expect(completeServiceRecord).toHaveBeenCalledWith('packet');
    expect(createClassifiedService).toHaveBeenCalledWith(expect.objectContaining({ publishToken: 'token' }));
    expect(screen.queryByText('Completed application PDF')).not.toBeInTheDocument();
  });

  it('does not navigate or complete when attachment creation fails', async () => {
    vi.mocked(createClassifiedService).mockRejectedValue(new Error('No packet documents are available.'));
    render(<ApplicationSelectorFlow availableApplications={[]} clientUsername="demo-client" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Create attachments and review' }));
    expect(await screen.findByText('No packet documents are available.')).toBeInTheDocument();
    expect(completeServiceRecord).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
