import getServerURL from '../../../serverOverride';
import type { ResolvedProfiles } from '../../../utils/directives';
import { buildProfileAnswers } from './flowLogic';
import { placeholderApplicationSelectorFlow } from './placeholderFlow';
import type { ApplicationSelectorAnswers, ApplicationSelectorFlowDefinition } from './types';

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

export const loadApplicationSelectorProfileAnswers = async (
  flow: ApplicationSelectorFlowDefinition,
  clientUsername?: string,
): Promise<ApplicationSelectorAnswers> => {
  const hasProfileSource = flow.questions.some((question) => question.answerSource?.type === 'profile');
  if (!hasProfileSource || !clientUsername) return {};

  const response = await fetch(`${getServerURL()}/get-user-info`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: clientUsername }),
  });
  if (!response.ok) return {};

  const clientProfile = await response.json();
  if (!clientProfile || clientProfile.status !== 'SUCCESS') return {};

  const profiles: ResolvedProfiles = {
    client: clientProfile,
  };
  return buildProfileAnswers(flow, profiles);
};
