import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useState } from 'react';

import { getInteractionCosts, InteractionCosts } from './communicationsApi';

const categoryNames: Record<string, string> = {
  TELEPHONY: 'Phone connection',
  CONVERSATION_RELAY: 'ConversationRelay',
  STUDIO: 'Studio',
  MODEL: 'AI model',
  RECORDING: 'Recording',
  TRANSCRIPTION: 'Transcription',
};

function money(amount: number | null, currency: string) {
  if (amount === null) return 'Pending';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 6,
  }).format(amount);
}

export function CostBreakdown({ costs }: { costs: InteractionCosts }) {
  if (costs.items.length === 0) return <p>No cost data is available for this call.</p>;
  const groups = new Map<string, { label: string; currency: string; amount: number;
    hasAmount: boolean; pending: boolean; unavailable: boolean; estimated: boolean }>();
  costs.items.forEach((line) => {
    const key = `${line.provider}-${line.category}-${line.currency}`;
    const group = groups.get(key) || {
      label: `${line.provider === 'TWILIO' ? 'Twilio' : 'OpenRouter'} · ${categoryNames[line.category] || line.category}`,
      currency: line.currency,
      amount: 0,
      hasAmount: false,
      pending: false,
      unavailable: false,
      estimated: false,
    };
    if (line.amount !== null) { group.amount += Number(line.amount); group.hasAmount = true; }
    group.pending ||= line.status === 'PENDING';
    group.unavailable ||= line.status === 'UNAVAILABLE';
    group.estimated ||= line.status === 'ESTIMATED';
    groups.set(key, group);
  });
  return (
    <div className="call-cost-breakdown">
      <strong>Interaction costs</strong>
      <table aria-label="Interaction cost breakdown">
        <thead><tr><th scope="col">Service</th><th scope="col">Cost</th></tr></thead>
        <tbody>
          {[...groups.entries()].map(([key, group]) => (
            <tr key={key}>
              <th scope="row">{group.label}</th>
              <td>
                {group.hasAmount && money(group.amount, group.currency)}
                {!group.hasAmount && (group.unavailable ? 'Unavailable' : 'Pending')}
                {(group.hasAmount && (group.pending || group.unavailable)) && <small>Partial</small>}
                {(group.hasAmount && !group.pending && !group.unavailable && group.estimated) && <small>Estimated</small>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {costs.totals.map((total) => (
            <tr key={total.currency}>
              <th scope="row">{total.status === 'PARTIAL' ? 'Known subtotal' : 'Total'} ({total.currency})</th>
              <td>{total.amount === null ? 'Not available' : money(total.amount, total.currency)}<small>{total.status.toLowerCase()}</small></td>
            </tr>
          ))}
        </tfoot>
      </table>
      <p>{costs.scope}</p>
      <p>Pending charges update automatically. Missing amounts are not zero.</p>
    </div>
  );
}

export default function CallCosts({ callId }: { callId: string }) {
  const [open, setOpen] = useState(false);
  const [costs, setCosts] = useState<InteractionCosts | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    setCosts(null);
    setFailed(false);
    const load = async () => {
      try {
        const result = await getInteractionCosts(callId, controller.signal);
        if (!controller.signal.aborted) { setCosts(result); setFailed(false); }
      } catch (_error) {
        if (!controller.signal.aborted) setFailed(true);
      }
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [open, callId]);
  let content = <p>Loading costs…</p>;
  if (costs) content = <CostBreakdown costs={costs} />;
  if (failed) content = <p>Costs could not be loaded. Reopen to retry.</p>;
  return (
    <Tooltip
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      placement="top-end"
      describeChild
      enterDelay={200}
      leaveDelay={150}
      arrow
      componentsProps={{ tooltip: { className: 'call-cost-tooltip' } }}
      title={content}
    >
      <button
        type="button"
        className="call-cost-button"
        aria-label="View call costs"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
      >
        Costs
      </button>
    </Tooltip>
  );
}
