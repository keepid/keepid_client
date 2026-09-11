/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApplicationSelectorFlow from './ApplicationSelectorFlow';
import { completeServiceRecord, createClassifiedService, loadCaseSelector, resolveCaseOutcome } from './flowApi';

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
