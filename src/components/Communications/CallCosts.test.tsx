/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CallCosts, { CostBreakdown } from './CallCosts';
import { getInteractionCosts, InteractionCosts } from './communicationsApi';

vi.mock('./communicationsApi', () => ({ getInteractionCosts: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const sample: InteractionCosts = {
  callId: 'call-one',
  items: [
    { id: '1', provider: 'TWILIO', category: 'TELEPHONY', amount: null, currency: 'USD', status: 'PENDING', pricingBasis: 'Provider', updatedAt: '' },
    { id: '2', provider: 'TWILIO', category: 'CONVERSATION_RELAY', amount: 0.21, currency: 'USD', status: 'ESTIMATED', pricingBasis: 'Rate', updatedAt: '' },
    { id: '3', provider: 'OPENROUTER', category: 'MODEL', amount: 0.000021, currency: 'USD', status: 'FINAL', pricingBasis: 'Provider', updatedAt: '' },
  ],
  totals: [{ currency: 'USD', amount: 0.210021, status: 'PARTIAL' }],
  scope: 'Excludes phone rental and taxes.',
};
describe('CallCosts', () => {
  it('distinguishes partial totals, estimates, pending charges and fractional cents', () => {
    render(<CostBreakdown costs={sample} />);
    expect(screen.getByText('Subtotal (USD)')).toBeInTheDocument();
    expect(screen.getByText('$0.000021')).toBeInTheDocument();
    expect(screen.getByText('~ Estimated · Some charges pending')).toBeInTheDocument();
    expect(screen.getByText('Twilio')).toBeInTheDocument();
    expect(screen.getByText('OpenRouter')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(sample.scope)).not.toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
  it('does not fabricate a zero for historical calls without data', () => {
    render(<CostBreakdown costs={{ ...sample, items: [], totals: [] }} />);
    expect(screen.getByText('No cost data available.')).toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
  it('loads on tap, not on transcript render, and closes with Escape', async () => {
    vi.mocked(getInteractionCosts).mockResolvedValue(sample);
    render(<CallCosts callId="call-one" />);
    expect(getInteractionCosts).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name: 'View call costs' });
    fireEvent.click(button);
    expect(await screen.findByText('Subtotal (USD)')).toBeInTheDocument();
    expect(getInteractionCosts).toHaveBeenCalledWith('call-one', expect.any(AbortSignal));
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
  it('offers retry instead of zero on API failure', async () => {
    vi.mocked(getInteractionCosts).mockRejectedValue(new Error('Unavailable'));
    render(<CallCosts callId="call-one" />);
    fireEvent.click(screen.getByRole('button', { name: 'View call costs' }));
    expect(await screen.findByText('Costs could not be loaded. Reopen to retry.')).toBeInTheDocument();
  });
  it('combines categories into provider rows and omits notes for final charges', () => {
    render(<CostBreakdown costs={{ ...sample,
      items: [
        { ...sample.items[0], amount: 0.05, status: 'FINAL' },
        { ...sample.items[1], amount: 0.2, status: 'FINAL' },
        sample.items[2],
      ],
      totals: [{ currency: 'USD', amount: 0.250021, status: 'FINAL' }],
    }}
    />);
    expect(screen.getAllByText('Twilio')).toHaveLength(1);
    expect(screen.getByText('$0.25')).toBeInTheDocument();
    expect(screen.getByText('Total (USD)')).toBeInTheDocument();
    expect(screen.queryByText(/Estimated|pending|unavailable/)).not.toBeInTheDocument();
  });
  it('keeps currencies separate and unknown amounts distinct from zero', () => {
    render(<CostBreakdown costs={{ ...sample,
      items: [sample.items[0], { ...sample.items[1], amount: null, currency: 'EUR', status: 'UNAVAILABLE' }],
      totals: [
        { currency: 'USD', amount: null, status: 'PARTIAL' },
        { currency: 'EUR', amount: null, status: 'PARTIAL' },
      ],
    }}
    />);
    expect(screen.getByText('Twilio (USD)')).toBeInTheDocument();
    expect(screen.getByText('Twilio (EUR)')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getAllByText('Unavailable')).toHaveLength(3);
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
});
