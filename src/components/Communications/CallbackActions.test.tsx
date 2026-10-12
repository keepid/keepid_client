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

import CallbackActions from './CallbackActions';
import { CallbackStatus, updateCallback } from './communicationsApi';

vi.mock('./communicationsApi', () => ({ updateCallback: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function callback(status: CallbackStatus) {
  return { id: 'callback-one', status, createdAt: '2026-10-12T09:00:00Z' };
}

describe('CallbackActions', () => {
  it('renders nothing for a call without a callback request', () => {
    const { container } = render(<CallbackActions callback={null} onChanged={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(['PENDING', 'ASSIGNED'] as CallbackStatus[])(
    'shows the badge and both actions while %s',
    (status) => {
      render(<CallbackActions callback={callback(status)} onChanged={vi.fn()} />);
      expect(screen.getByText('Needs callback')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "I'll call" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mark called' })).toBeInTheDocument();
    },
  );

  it('shows a quiet label, and no actions, once called back or cancelled', () => {
    const { rerender } = render(<CallbackActions callback={callback('COMPLETED')} onChanged={vi.fn()} />);
    expect(screen.getByText('Called back')).toBeInTheDocument();
    expect(screen.queryByText('Needs callback')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<CallbackActions callback={callback('CANCELLED')} onChanged={vi.fn()} />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it("assigns with I'll call and then refreshes", async () => {
    vi.mocked(updateCallback).mockResolvedValue({ status: 'SUCCESS' });
    const onChanged = vi.fn();
    render(<CallbackActions callback={callback('PENDING')} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: "I'll call" }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(updateCallback).toHaveBeenCalledWith('callback-one', 'assign', undefined);
  });

  it('completes with Mark called, sending a trimmed optional note', async () => {
    vi.mocked(updateCallback).mockResolvedValue({ status: 'SUCCESS' });
    const onChanged = vi.fn();
    render(<CallbackActions callback={callback('ASSIGNED')} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark called' }));
    fireEvent.change(screen.getByLabelText('Callback note (optional)'), {
      target: { value: '  Reached them; booked a visit.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1));
    expect(updateCallback).toHaveBeenCalledWith('callback-one', 'complete', 'Reached them; booked a visit.');
  });

  it('completes without a note when none is typed, and can be cancelled out of', async () => {
    vi.mocked(updateCallback).mockResolvedValue({ status: 'SUCCESS' });
    render(<CallbackActions callback={callback('PENDING')} onChanged={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark called' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(updateCallback).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Mark called' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark called' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(updateCallback).toHaveBeenCalledWith('callback-one', 'complete', undefined));
  });

  it('shows the server message and does not refresh when the action is refused', async () => {
    vi.mocked(updateCallback).mockResolvedValue({
      status: 'INVALID_STATE',
      message: 'This callback request is already completed.',
    });
    const onChanged = vi.fn();
    render(<CallbackActions callback={callback('PENDING')} onChanged={onChanged} />);

    fireEvent.click(screen.getByRole('button', { name: "I'll call" }));

    expect(await screen.findByRole('alert')).toHaveTextContent('already completed');
    expect(onChanged).not.toHaveBeenCalled();
  });
});
