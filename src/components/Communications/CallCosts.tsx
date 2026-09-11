import Tooltip from '@mui/material/Tooltip';
import React, { useEffect, useState } from 'react';

import { getInteractionCosts, InteractionCosts } from './communicationsApi';

function money(amount: number | null, currency: string) {
  if (amount === null) return 'Pending';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 6,
  }).format(amount);
}

export function CostBreakdown({ costs }: { costs: InteractionCosts }) {
  if (costs.items.length === 0) return <span>No cost data available.</span>;
  const groups = new Map<string, { label: string; currency: string; amount: number;
    hasAmount: boolean; pending: boolean; unavailable: boolean; estimated: boolean }>();
  costs.items.forEach((line) => {
    const key = `${line.provider}-${line.currency}`;
    const group = groups.get(key) || {
      label: line.provider === 'TWILIO' ? 'Twilio' : 'OpenRouter',
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
  const estimated = costs.items.some((line) => line.status === 'ESTIMATED');
  const pending = costs.items.some((line) => line.status === 'PENDING');
  const unavailable = costs.items.some((line) => line.status === 'UNAVAILABLE');
  const notes = [
    estimated && '~ Estimated',
    pending && 'Some charges pending',
    unavailable && 'Some charges unavailable',
  ].filter(Boolean);
  const multipleCurrencies = new Set(costs.items.map((line) => line.currency)).size > 1;
  return (
    <div className="call-cost-breakdown">
      <dl>
        {costs.totals.map((total) => (
          <div className="call-cost-total" key={total.currency}>
            <dt>{total.status === 'PARTIAL' ? 'Subtotal' : 'Total'} ({total.currency})</dt>
            <dd>
              {total.amount !== null && costs.items.some((line) => line.currency === total.currency && line.status === 'ESTIMATED') && '~'}
              {total.amount === null ? 'Unavailable' : money(total.amount, total.currency)}
            </dd>
          </div>
        ))}
        {[...groups.entries()].map(([key, group]) => (
          <div className="call-cost-provider" key={key}>
            <dt>{group.label}{multipleCurrencies && ` (${group.currency})`}</dt>
            <dd>
              {group.hasAmount && group.estimated && '~'}
              {group.hasAmount && money(group.amount, group.currency)}
              {!group.hasAmount && (group.pending ? 'Pending' : 'Unavailable')}
            </dd>
          </div>
        ))}
      </dl>
      {notes.length > 0 && <p>{notes.join(' · ')}</p>}
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
