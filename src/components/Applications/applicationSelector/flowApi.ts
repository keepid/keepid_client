import getServerURL from '../../../serverOverride';
import type {
  FulfillmentMode,
  ResolvedOutcome,
  SelectorFlow,
  SelectorPathStep,
  ServiceRecordResult,
} from './types';

interface TraversalRequest {
  clientUsername: string;
  publishToken: string;
  path: SelectorPathStep[];
  responses: Record<string, string>;
}

export interface ManualServiceRequest {
  clientUsername: string;
  idempotencyKey: string;
  serviceTitle: string;
  manualReason: 'NO_MATCH' | 'UNSURE' | 'URGENT_BYPASS' | 'OTHER';
  manualReasonDetail?: string;
  clientInstructionsMarkdown: string;
  workerInstructionsMarkdown?: string;
  fulfillmentMode: FulfillmentMode;
  registryEntryId?: string;
  attemptedPath: SelectorPathStep[];
  responses: Record<string, string>;
}

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${getServerURL()}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'The case selector request failed.');
    Object.assign(error, { code: body.error, status: response.status });
    throw error;
  }
  return body as T;
};

export const loadCaseSelector = (): Promise<SelectorFlow> =>
  requestJson('/api/case-selector');

export const resolveCaseOutcome = (request: TraversalRequest): Promise<ResolvedOutcome> =>
  requestJson('/api/case-selector/resolve', {
    method: 'POST',
    body: JSON.stringify(request),
  });

export const createClassifiedService = (
  request: TraversalRequest & { idempotencyKey: string; confirmedEffectIds: string[] },
): Promise<ServiceRecordResult> => requestJson('/api/service-records/from-selector', {
  method: 'POST',
  body: JSON.stringify(request),
});

export const previewManualService = (
  request: Omit<ManualServiceRequest, 'idempotencyKey' | 'manualReason'>,
): Promise<Pick<ResolvedOutcome, 'serviceTitle' | 'workerInstructionsMarkdown' | 'clientSheetMarkdown' | 'fulfillmentMode'>> =>
  requestJson('/api/service-records/manual/preview', {
    method: 'POST',
    body: JSON.stringify(request),
  });

export const createManualService = (
  request: ManualServiceRequest,
): Promise<ServiceRecordResult> => requestJson('/api/service-records/manual', {
  method: 'POST',
  body: JSON.stringify(request),
});

export const uploadServicePdf = async (applicationId: string, file: File): Promise<void> => {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(
    `${getServerURL()}/api/service-records/${encodeURIComponent(applicationId)}/primary-pdf`,
    { method: 'POST', credentials: 'include', body: form },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Could not save the PDF.');
};

export const completeServiceRecord = async (applicationId: string): Promise<void> => {
  await requestJson(`/api/service-records/${encodeURIComponent(applicationId)}/complete`, {
    method: 'POST',
  });
};
