import getServerURL from '../../../serverOverride';
import type { ResolvedProfiles } from '../../../utils/directives';
import applicationSelectorFlowData from './applicationSelectorFlow.json';
import { buildProfileAnswers } from './flowLogic';
import type { ApplicationSelectorAnswers, ApplicationSelectorFlowDefinition } from './types';

export const applicationSelectorFlowDefinition =
  applicationSelectorFlowData as ApplicationSelectorFlowDefinition;

const isApplicationSelectorFlowDefinition = (
  value: unknown,
): value is ApplicationSelectorFlowDefinition => {
  if (!value || typeof value !== 'object') return false;
  const flow = value as Partial<ApplicationSelectorFlowDefinition>;
  return typeof flow.id === 'string'
    && typeof flow.title === 'string'
    && Array.isArray(flow.questions)
    && Array.isArray(flow.outcomes);
};

export const loadApplicationSelectorFlow = async (): Promise<ApplicationSelectorFlowDefinition> => {
  try {
    const response = await fetch(`${getServerURL()}/application-selector-flow`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return applicationSelectorFlowDefinition;

    const remoteFlow = await response.json();
    if (!isApplicationSelectorFlowDefinition(remoteFlow)) {
      return applicationSelectorFlowDefinition;
    }
    return remoteFlow;
  } catch {
    return applicationSelectorFlowDefinition;
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
