import { describe, expect, it } from 'vitest';

import { advanceShortcut, getOutcomeShortcuts } from './outcomeShortcuts';
import type { SelectorFlow, SelectorNode, SelectorOutcomeSummary } from './types';

const outcome = (id: string, status: 'ACTIVE' | 'DEPRECATED' = 'ACTIVE'): SelectorOutcomeSummary => ({
  id, code: id, title: id, displayName: id, status, fulfillmentMode: 'INSTRUCTIONS_ONLY', components: [],
});
const choice = (id: string, children: string[], componentKey?: string): SelectorNode => ({
  id,
  type: 'CHOICE',
  componentKey,
  transitions: children.map((child) => ({ id: child, key: child, childNodeId: child, type: 'CHOICE', label: child })),
});
const leaf = (id: string, outcomeId = id): SelectorNode => ({ id, outcomeId, type: 'OUTCOME', transitions: [] });
const flow: SelectorFlow = {
  selectorId: 'picker',
  publishToken: 'published',
  title: 'Picker',
  rootNodeId: 'root',
  nodes: [
    choice('root', ['direct', 'details', 'old', 'missing', 'loop']),
    leaf('direct', 'shared'), choice('details', ['decision'], 'penndot-number'),
    choice('decision', ['other']), leaf('other', 'shared'), leaf('old'), leaf('missing'),
    leaf('unreachable'), choice('loop', ['root']),
  ],
  outcomes: [outcome('shared'), outcome('old', 'DEPRECATED'), outcome('unreachable')],
};

describe('published outcome shortcuts', () => {
  it('only includes reachable active outcomes and preserves distinct routes to a shared outcome', () => {
    const shortcuts = getOutcomeShortcuts(flow);
    expect(shortcuts.map((item) => item.nodeId).sort()).toEqual(['direct', 'other']);
    expect(shortcuts.find((item) => item.nodeId === 'other')?.labels).toEqual(['details', 'other']);
  });

  it('skips decisions but stops at components and retains a contiguous path when resuming', () => {
    const shortcut = getOutcomeShortcuts(flow).find((item) => item.nodeId === 'other')!;
    expect(advanceShortcut(flow, shortcut)).toEqual({
      nodeId: 'details', path: [{ nodeId: 'root', transitionKey: 'details' }],
    });
    expect(advanceShortcut(flow, shortcut, 2)).toEqual({ nodeId: 'other', path: shortcut.path });
  });

  it('can jump directly to an outcome without interaction steps', () => {
    const shortcut = getOutcomeShortcuts(flow).find((item) => item.nodeId === 'direct')!;
    expect(advanceShortcut(flow, shortcut)).toEqual({ nodeId: 'direct', path: shortcut.path });
  });
});
