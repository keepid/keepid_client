import getServerURL from '../../../serverOverride';

export interface GetQuestionsV2Response {
  status: string;
  title?: string;
  description?: string;
  fields?: unknown[];
  resolvedProfiles?: {
    client?: Record<string, unknown>;
    worker?: Record<string, unknown>;
    org?: Record<string, unknown>;
  };
}

export interface GetInteractiveFormConfigResponse {
  jsonSchema: Record<string, unknown>;
  uiSchema: Record<string, unknown>;
  builderState?: Record<string, unknown>;
}

export async function getInteractiveFormConfig(
  applicationId: string,
): Promise<GetInteractiveFormConfigResponse> {
  const res = await fetch(`${getServerURL()}/get-interactive-form-config`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function getQuestionsV2(
  applicationId: string,
  clientUsername?: string,
): Promise<GetQuestionsV2Response> {
  const res = await fetch(`${getServerURL()}/get-questions-2`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationId, clientUsername: clientUsername ?? '' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function fillPdfBlob(
  applicationId: string,
  formAnswers: Record<string, unknown>,
  clientUsername = '',
): Promise<Blob> {
  const form = new FormData();
  form.append('applicationId', applicationId);
  form.append('formAnswers', JSON.stringify(formAnswers));
  form.append('clientUsername', clientUsername);
  const res = await fetch(`${getServerURL()}/fill-pdf-2`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const blob = await res.blob();
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
}

export async function uploadCompletedPdf(
  file: Blob | File,
  applicationId: string,
  formAnswers: Record<string, unknown>,
  clientUsername = '',
): Promise<{ status: string }> {
  const form = new FormData();
  form.append('file', file, file instanceof File ? file.name : 'application.pdf');
  form.append('applicationId', applicationId);
  form.append('formAnswers', JSON.stringify(formAnswers));
  form.append('clientUsername', clientUsername);
  const res = await fetch(`${getServerURL()}/upload-completed-pdf-2`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || res.statusText);
  }
  return json;
}
