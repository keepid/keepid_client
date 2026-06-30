import {
  type ResolvedProfiles,
  resolveDirectiveFromProfiles,
} from '../../../utils/directives';
import type {
  ApplicationSelectorAnswers,
  ApplicationSelectorFlowDefinition,
  ApplicationSelectorQuestion,
} from './types';

const hasAnswerValue = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).trim().length > 0;

export const normalizeSelectorAnswerValue = (value: unknown): string | undefined => {
  if (!hasAnswerValue(value)) return undefined;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value).trim();
};

export const questionConditionsMatch = (
  question: ApplicationSelectorQuestion,
  answers: ApplicationSelectorAnswers,
): boolean => (question.showWhen || []).every(
  (condition) => answers[condition.questionId] === condition.value,
);

export const isQuestionApplicable = (
  question: ApplicationSelectorQuestion,
  answers: ApplicationSelectorAnswers,
): boolean => questionConditionsMatch(question, answers);

const isProfileAnswered = (
  question: ApplicationSelectorQuestion,
  profileAnswers: ApplicationSelectorAnswers,
): boolean => question.type === 'singleChoice' && profileAnswers[question.id] !== undefined;

export const isQuestionRenderable = (
  question: ApplicationSelectorQuestion,
  answers: ApplicationSelectorAnswers,
  profileAnswers: ApplicationSelectorAnswers,
): boolean => isQuestionApplicable(question, answers) && !isProfileAnswered(question, profileAnswers);

export const getActiveAnswerQuestionIds = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers,
): string[] => flow.questions
  .filter((question) => question.type === 'singleChoice' && isQuestionApplicable(question, answers))
  .map((question) => question.id);

export const getNextRenderableStepIndex = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers,
  startIndex: number,
  profileAnswers: ApplicationSelectorAnswers,
): number => {
  for (let i = Math.max(startIndex, 0); i < flow.questions.length; i += 1) {
    if (isQuestionRenderable(flow.questions[i], answers, profileAnswers)) return i;
  }
  return flow.questions.length;
};

export const getPreviousRenderableStepIndex = (
  flow: ApplicationSelectorFlowDefinition,
  answers: ApplicationSelectorAnswers,
  startIndex: number,
  profileAnswers: ApplicationSelectorAnswers,
): number | null => {
  for (let i = Math.min(startIndex, flow.questions.length - 1); i >= 0; i -= 1) {
    if (isQuestionRenderable(flow.questions[i], answers, profileAnswers)) return i;
  }
  return null;
};

export const resolveProfileAnswerForQuestion = (
  question: ApplicationSelectorQuestion,
  profiles: ResolvedProfiles | null | undefined,
): string | undefined => {
  if (question.type !== 'singleChoice' || question.answerSource?.type !== 'profile') {
    return undefined;
  }

  const field = question.answerSource.field.trim();
  const resolved = resolveDirectiveFromProfiles(field, profiles);
  const fallbackResolved = resolved === undefined && !field.includes('.')
    ? resolveDirectiveFromProfiles(`client.${field}`, profiles)
    : resolved;
  const value = normalizeSelectorAnswerValue(fallbackResolved);
  if (value === undefined) return undefined;
  return question.options.some((option) => option.value === value) ? value : undefined;
};

export const buildProfileAnswers = (
  flow: ApplicationSelectorFlowDefinition,
  profiles: ResolvedProfiles | null | undefined,
): ApplicationSelectorAnswers => flow.questions.reduce<ApplicationSelectorAnswers>((answers, question) => {
  const value = resolveProfileAnswerForQuestion(question, profiles);
  if (value !== undefined) {
    return {
      ...answers,
      [question.id]: value,
    };
  }
  return answers;
}, {});
