import type { OutcomeShortcutTarget, SelectorFlow, SelectorOutcomeSummary, SelectorPathStep } from './types';

export interface OutcomeShortcut {
  nodeId: string;
  outcome: SelectorOutcomeSummary;
  path: SelectorPathStep[];
  labels: string[];
}

export const getOutcomeShortcutLabel = (outcome: SelectorOutcomeSummary): string => (
  outcome.shortLabel?.trim() || outcome.displayName || outcome.title
);

// Keep each route when several leaves share an outcome: their responses and
// instructions may depend on different questions along the way.
export const getOutcomeShortcuts = (flow: SelectorFlow): OutcomeShortcut[] => {
  const nodes = new Map(flow.nodes.map((node) => [node.id, node]));
  const outcomes = new Map(flow.outcomes.map((outcome) => [outcome.id, outcome]));
  const shortcuts: OutcomeShortcut[] = [];
  const visit = (nodeId: string, path: SelectorPathStep[], labels: string[]) => {
    const node = nodes.get(nodeId);
    if (!node || path.some((step) => step.nodeId === nodeId)) return;
    if (node.type === 'OUTCOME') {
      const outcome = outcomes.get(node.outcomeId || '');
      if (outcome?.status === 'ACTIVE') shortcuts.push({ nodeId, outcome, path, labels });
      return;
    }
    node.transitions.forEach((transition) => visit(
      transition.childNodeId,
      [...path, { nodeId, transitionKey: transition.key }],
      !node.componentKey && transition.label ? [...labels, transition.label] : labels,
    ));
  };
  visit(flow.rootNodeId, [], []);
  return shortcuts.sort((a, b) => (
    getOutcomeShortcutLabel(a.outcome).localeCompare(getOutcomeShortcutLabel(b.outcome))
    || a.labels.join(' / ').localeCompare(b.labels.join(' / '))
  ));
};

export const outcomeShortcutLocation = (clientUsername: string, clientName: string, target: OutcomeShortcutTarget) => ({
  pathname: '/applications/selector',
  search: `?${new URLSearchParams({ client: clientUsername, outcomeNode: target.nodeId, publishToken: target.publishToken })}`,
  state: { clientUsername, clientName, outcomeShortcut: target },
});
