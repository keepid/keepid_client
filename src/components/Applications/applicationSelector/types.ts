export type FulfillmentMode = 'WEB_FORM' | 'PDF_UPLOAD' | 'INSTRUCTIONS_ONLY';

export interface SelectorTransition {
  id: string;
  key: string;
  type: 'CHOICE' | 'SUBMIT' | 'RESULT';
  label?: string | null;
  description?: string | null;
  assetId?: string | null;
  assetAltText?: string | null;
  childNodeId: string;
}

export interface SelectorNode {
  id: string;
  type: 'CHOICE' | 'INTERACTION' | 'OUTCOME';
  question?: string | null;
  description?: string | null;
  componentKey?: string | null;
  componentVersion?: number | null;
  componentConfig?: Record<string, unknown> | null;
  responseKey?: string | null;
  responsePersistence?: 'TRANSIENT' | 'SERVICE_RECORD' | null;
  outcomeId?: string | null;
  transitions: SelectorTransition[];
}

export interface OutcomeComponent {
  id: string;
  key: string;
  version: number;
  config: Record<string, unknown>;
}

export interface SelectorOutcomeSummary {
  id: string;
  code: string;
  displayName: string;
  title: string;
  status: 'ACTIVE' | 'DEPRECATED';
  fulfillmentMode: FulfillmentMode;
  registryEntryId?: string | null;
  components: OutcomeComponent[];
}

export interface SelectorFlow {
  selectorId: string;
  publishToken: string;
  title: string;
  description?: string | null;
  rootNodeId: string;
  nodes: SelectorNode[];
  outcomes: SelectorOutcomeSummary[];
}

export interface SelectorPathStep {
  nodeId: string;
  transitionKey: string;
}

export interface ProposedAction {
  effectId: string;
  type: 'PROPOSE_CLIENT_NOTE';
  label: string;
  bodyMarkdown: string;
}

export interface ResolvedOutcome {
  outcomeId: string;
  outcomeCode: string;
  serviceTitle: string;
  workerInstructionsMarkdown: string;
  clientSheetMarkdown: string;
  fulfillmentMode: FulfillmentMode;
  registryEntryId?: string | null;
  components: OutcomeComponent[];
  proposedActions: ProposedAction[];
}

export interface ServiceRecordResult extends Partial<ResolvedOutcome> {
  applicationId: string;
  serviceRecordId: string;
  classificationStatus: 'CLASSIFIED' | 'MANUAL_UNCLASSIFIED';
  fulfillmentMode: FulfillmentMode;
  registryEntryId?: string | null;
}

export interface RegistryApplicationOption {
  applicationId: string;
  label: string;
  state: string;
  idType: string;
  housingStatus: string;
}
