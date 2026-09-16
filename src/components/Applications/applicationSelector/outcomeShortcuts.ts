import type { SelectorFlow, SelectorOutcomeSummary, SelectorPathStep } from './types';

export interface OutcomeShortcut {
  nodeId: string;
  outcome: SelectorOutcomeSummary;
  path: SelectorPathStep[];
  labels: string[];
}

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
    a.outcome.displayName.localeCompare(b.outcome.displayName)
    || a.labels.join(' / ').localeCompare(b.labels.join(' / '))
  ));
};

// Skip only decisions. Components still run normally for validation, saved
// client details, information, and uploads before the server resolves the path.
export const advanceShortcut = (
  flow: SelectorFlow,
  shortcut: OutcomeShortcut,
  completedSteps = 0,
): { nodeId: string; path: SelectorPathStep[] } => {
  const nodes = new Map(flow.nodes.map((node) => [node.id, node]));
  let index = completedSteps;
  while (index < shortcut.path.length && !nodes.get(shortcut.path[index].nodeId)?.componentKey) {
    index += 1;
  }
  return {
    nodeId: shortcut.path[index]?.nodeId || shortcut.nodeId,
    path: shortcut.path.slice(0, index),
  };
};
