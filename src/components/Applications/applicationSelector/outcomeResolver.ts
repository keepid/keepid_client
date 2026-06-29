import type {
  ApplicationSelectorAnswers,
  ApplicationSelectorFlowDefinition,
  ApplicationSelectorOutcome,
} from './types';

export const getAnswerQuestionIds = (
  flow: ApplicationSelectorFlowDefinition,
): string[] => flow.questions
  .filter((question) => question.type === 'singleChoice')
  .map((question) => question.id);

export const resolveApplicationSelectorOutcome = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers,
): ApplicationSelectorOutcome | null => {
  const answerQuestionIds = getAnswerQuestionIds(flow);
  const completedAnswerIds = answerQuestionIds.filter((questionId) => answers[questionId]);

  if (completedAnswerIds.length !== answerQuestionIds.length) {
    return null;
  }

  return flow.outcomes.find((outcome) => {
    if (outcome.matches.length !== completedAnswerIds.length) {
      return false;
    }

    return outcome.matches.every((match) => answers[match.questionId] === match.value);
  }) || null;
};
