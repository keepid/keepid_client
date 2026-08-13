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
  requestJson('/api/case-selector', { cache: 'no-store' });

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

export interface ClientLoginDetails {
  penndotNumber: string;
  birthDate: string;
}

export const loadClientLoginDetails = async (username = ''): Promise<ClientLoginDetails> => {
  const result = await requestJson<{
    status?: string;
    message?: string;
    penndotNumber?: string;
    birthDate?: string;
  }>('/get-user-info', {
    method: 'POST',
    body: JSON.stringify(username ? { username } : {}),
  });
  if (result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Could not load the client login details.');
  }
  return {
    penndotNumber: result.penndotNumber || '',
    birthDate: result.birthDate || '',
  };
};

export const loadPennDotNumber = async (username = ''): Promise<string> => (
  (await loadClientLoginDetails(username)).penndotNumber
);

export const savePennDotNumber = async (username: string, penndotNumber: string): Promise<void> => {
  const result = await requestJson<{ status?: string; message?: string }>('/update-user-profile', {
    method: 'POST',
    body: JSON.stringify({
      ...(username ? { username } : {}),
      penndotNumber,
    }),
  });
  if (result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Could not save the PennDOT number.');
  }
};
