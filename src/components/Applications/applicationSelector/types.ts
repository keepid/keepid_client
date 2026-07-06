export interface ApplicationSelectorOption {
  value: string;
  label: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface ApplicationSelectorAnswerSource {
  type: 'profile';
  field: string;
}

export interface ApplicationSelectorQuestion {
  id: string;
  title: string;
  description?: string | null;
  type: 'singleChoice' | 'componentPage';
  answerSource?: ApplicationSelectorAnswerSource | null;
  showWhen: ApplicationSelectorAnswerMatch[];
  options: ApplicationSelectorOption[];
  includeComponents: string[];
}

export interface ApplicationSelectorAnswerMatch {
  questionId: string;
  value: string;
}

export interface ApplicationSelectorOutcome {
  id: string;
  title: string;
  applicationId?: string | null;
  applicationLabel?: string | null;
  uploadLabel?: string | null;
  instructionsMarkdown?: string | null;
  matches: ApplicationSelectorAnswerMatch[];
  includeComponents: string[];
}

export interface ApplicationSelectorFlowDefinition {
  id: string;
  title: string;
  description?: string | null;
  listImageUrl?: string | null;
  questions: ApplicationSelectorQuestion[];
  outcomes: ApplicationSelectorOutcome[];
}

export type ApplicationSelectorAnswers = Record<string, string>;

export interface RegistryApplicationOption {
  applicationId: string;
  label: string;
  state: string;
  idType: string;
  housingStatus: string;
}
