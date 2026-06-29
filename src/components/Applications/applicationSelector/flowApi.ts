import getServerURL from '../../../serverOverride';
import { placeholderApplicationSelectorFlow } from './placeholderFlow';
import type { ApplicationSelectorFlowDefinition } from './types';

export const loadApplicationSelectorFlow = async (): Promise<ApplicationSelectorFlowDefinition> => {
  try {
    const response = await fetch(`${getServerURL()}/get-application-selector-flow`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      return placeholderApplicationSelectorFlow;
    }
    const flow = await response.json();
    if (!flow || !Array.isArray(flow.questions) || !Array.isArray(flow.outcomes)) {
      return placeholderApplicationSelectorFlow;
    }
    return flow;
  } catch {
    return placeholderApplicationSelectorFlow;
  }
};
