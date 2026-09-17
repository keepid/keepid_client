import { describe, expect, it } from 'vitest';

import { getOutcomeShortcutLabel, getOutcomeShortcuts } from './outcomeShortcuts';
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
  it('uses service labels with fallbacks for older published outcomes', () => {
    expect(getOutcomeShortcutLabel({ ...outcome('New outcome'), shortLabel: 'PA Housed BC' })).toBe('PA Housed BC');
    expect(getOutcomeShortcutLabel(outcome('Existing name'))).toBe('Existing name');
    expect(getOutcomeShortcutLabel({ ...outcome('Existing name'), shortLabel: ' ' })).toBe('Existing name');
    expect(getOutcomeShortcutLabel({ ...outcome('Service title'), displayName: '' })).toBe('Service title');
  });

  it('sorts shortcuts by the service label shown on each card', () => {
    const sorted = getOutcomeShortcuts({
      ...flow,
      nodes: [choice('root', ['a', 'b']), leaf('a'), leaf('b')],
      outcomes: [
        { ...outcome('a'), shortLabel: 'PA Housed BC' },
        { ...outcome('b'), shortLabel: 'PA Homeless BC' },
      ],
    });
    expect(sorted.map((item) => item.nodeId)).toEqual(['b', 'a']);
  });

  it('only includes reachable active outcomes and preserves distinct routes to a shared outcome', () => {
    const shortcuts = getOutcomeShortcuts(flow);
    expect(shortcuts.map((item) => item.nodeId).sort()).toEqual(['direct', 'other']);
    expect(shortcuts.find((item) => item.nodeId === 'other')?.labels).toEqual(['details', 'other']);
  });
});
