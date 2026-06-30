import { getActiveAnswerQuestionIds } from './flowLogic';
import type {
  ApplicationSelectorAnswers,
  ApplicationSelectorFlowDefinition,
  ApplicationSelectorOutcome,
} from './types';

export const getAnswerQuestionIds = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers = {},
): string[] => getActiveAnswerQuestionIds(flow, answers);

export const resolveApplicationSelectorOutcome = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers,
): ApplicationSelectorOutcome | null => {
  const answerQuestionIds = getAnswerQuestionIds(flow, answers);
  const answerQuestionIdSet = new Set(answerQuestionIds);
  const completedAnswerIds = answerQuestionIds.filter((questionId) => answers[questionId]);

  if (completedAnswerIds.length !== answerQuestionIds.length) {
    return null;
  }

  return flow.outcomes.find((outcome) => {
    if (outcome.matches.length !== completedAnswerIds.length) {
      return false;
    }

    return outcome.matches.every(
      (match) => answerQuestionIdSet.has(match.questionId) && answers[match.questionId] === match.value,
    );
  }) || null;
};
