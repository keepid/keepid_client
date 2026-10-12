/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { getMessageBoard, MessageBoardItem, updateCallback } from '../Communications/communicationsApi';
import ClientTimelineSection from './ClientTimelineSection';

vi.mock('react-alert', () => ({ useAlert: () => ({ show: vi.fn() }) }));
vi.mock('../Communications/communicationsApi', () => ({
  getCallRecordingPlaybackUrl: (id: string) => `/recording/${id}`,
  getMessageBoard: vi.fn(),
  updateClientNote: vi.fn(),
  updateCallback: vi.fn(),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function callItem(callback: MessageBoardItem['callback']): MessageBoardItem {
  return {
    type: 'call',
    sourceId: 'call-one',
    occurredAt: '2026-10-12T09:00:00Z',
    title: 'Inbound call',
    body: 'Caller: Please call me back.',
    flow: 'VOICE_AGENT',
    callback,
  };
}

function board(items: MessageBoardItem[]) {
  return {
    status: 'SUCCESS', items, calls: [], notes: [],
  };
}

describe('ClientTimelineSection callbacks', () => {
  it('marks a call that needs a callback, and refreshes the timeline after "I\'ll call"', async () => {
    vi.mocked(getMessageBoard)
      .mockResolvedValueOnce(board([callItem({ id: 'cb-1', status: 'PENDING' })]))
      .mockResolvedValueOnce(board([callItem({ id: 'cb-1', status: 'COMPLETED' })]));
    vi.mocked(updateCallback).mockResolvedValue({ status: 'SUCCESS' });

    render(<ClientTimelineSection username="alice" />);
    expect(await screen.findByText('Needs callback')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "I'll call" }));

    await waitFor(() => expect(updateCallback).toHaveBeenCalledWith('cb-1', 'assign', undefined));
    expect(await screen.findByText('Called back')).toBeInTheDocument();
    expect(getMessageBoard).toHaveBeenCalledTimes(2);
  });

  it('shows nothing extra on calls without a callback request', async () => {
    vi.mocked(getMessageBoard).mockResolvedValue(board([callItem(null)]));

    render(<ClientTimelineSection username="alice" />);

    expect(await screen.findByText('Inbound call')).toBeInTheDocument();
    expect(screen.queryByText('Needs callback')).not.toBeInTheDocument();
    expect(screen.queryByText('Called back')).not.toBeInTheDocument();
  });
});
