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
    director?: Record<string, unknown>;
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
  // The new server returns 200 + `{ error: "..." }` on failure (the legacy
  // server returned 400/404). Surface the error message so callers can
  // surface a useful message instead of crashing on `response.jsonSchema`.
  const json = (await res.json()) as { error?: string } & GetInteractiveFormConfigResponse;
  if (json && typeof json.error === 'string' && json.error.length > 0) {
    // The most common failure for migrated registry entries is the missing
    // jsonSchema/uiSchema columns (legacy entries didn't have them — they
    // need to be authored in the developer portal). Replace the raw "No
    // interactive form config found" string with something a non-engineer
    // can act on, while leaving other errors (auth, network) untouched.
    const msg = json.error.toLowerCase().includes('no interactive form config')
      ? 'This application form has no interactive configuration yet. '
        + 'A developer can add one in the developer portal '
        + '(Forms → this template → Interactive Form Builder).'
      : json.error;
    throw new Error(msg);
  }
  return json;
}

export async function getQuestionsV2(
  applicationId: string,
  clientUsername?: string,
): Promise<GetQuestionsV2Response> {
  const res = await fetch(`${getServerURL()}/get-form-questions`, {
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
  return fillPdfBlobWithOptions(applicationId, formAnswers, clientUsername, false);
}

async function fillPdfBlobWithOptions(
  applicationId: string,
  formAnswers: Record<string, unknown>,
  clientUsername: string,
  preview: boolean,
): Promise<Blob> {
  const form = new FormData();
  form.append('applicationId', applicationId);
  form.append('formAnswers', JSON.stringify(formAnswers));
  form.append('clientUsername', clientUsername);
  if (preview) {
    form.append('preview', 'true');
  }
  const res = await fetch(`${getServerURL()}/fill-pdf`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/pdf')) {
    const text = await res.text();
    let message = text || 'Failed to fill PDF';
    try {
      const parsed = JSON.parse(text) as { message?: string; status?: string };
      message = parsed.message || parsed.status || message;
    } catch {
      // leave message as-is for non-JSON payloads
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
}

export async function fillAttachmentPdfBlob(
  attachmentFileId: string,
  formAnswers: Record<string, unknown>,
  clientUsername = '',
): Promise<Blob> {
  return fillPdfBlobWithOptions(attachmentFileId, formAnswers, clientUsername, true);
}

export async function uploadCompletedPdf(
  file: Blob | File,
  applicationId: string,
  formAnswers: Record<string, unknown>,
  clientUsername = '',
): Promise<{ status: string; applicationId?: string; fileId?: string }> {
  const form = new FormData();
  form.append('file', file, file instanceof File ? file.name : 'application.pdf');
  form.append('applicationId', applicationId);
  form.append('formAnswers', JSON.stringify(formAnswers));
  form.append('clientUsername', clientUsername);
  const res = await fetch(`${getServerURL()}/save-application`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json?.status !== 'SUCCESS') {
    throw new Error(json.message || json.error || res.statusText);
  }
  return json;
}

export async function listApplicationPdfIds(
  clientUsername = '',
): Promise<string[]> {
  const res = await fetch(`${getServerURL()}/get-files`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileType: 'APPLICATION_PDF',
      ...(clientUsername ? { targetUser: clientUsername } : {}),
    }),
  });
  const json = await res.json();
  if (!res.ok || json?.status !== 'SUCCESS' || !Array.isArray(json?.documents)) {
    throw new Error(json?.message || json?.error || res.statusText);
  }
  return json.documents
    .map((doc: { id?: string }) => doc.id)
    .filter((id: string | undefined): id is string => Boolean(id));
}

/**
 * Asks the server to render the full application packet (base PDF + enabled attachments) into a
 * single flattened PDF using the same PDFBox-based pipeline as Lob mail upload (Print / Download
 * match the mailed file; Lob adds the address cover via address_placement=insert_blank_page).
 *
 * When `mainPdfOverride` is provided, those bytes replace the stored application PDF for this
 * render only -- this lets the UI print/download the user's in-progress in-viewer edits (live
 * pdf.js form widget text + embedded signatures) without having to press "Save" first. The
 * override is NOT persisted on the server.
 */
export async function renderApplicationPacket(
  applicationId: string,
  mainPdfOverride?: Blob | File,
): Promise<Blob> {
  const form = new FormData();
  form.append('applicationId', applicationId);
  if (mainPdfOverride) {
    form.append(
      'mainPdf',
      mainPdfOverride,
      mainPdfOverride instanceof File ? mainPdfOverride.name : 'application.pdf',
    );
  }
  const res = await fetch(`${getServerURL()}/render-application-packet`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = text || res.statusText || 'Failed to render application packet';
    try {
      const parsed = JSON.parse(text) as { message?: string; status?: string };
      message = parsed.message || parsed.status || message;
    } catch {
      // leave message as-is for non-JSON payloads
    }
    throw new Error(message);
  }
  const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/pdf')) {
    const text = await res.text();
    let message = text || 'Server returned non-PDF response';
    try {
      const parsed = JSON.parse(text) as { message?: string; status?: string };
      message = parsed.message || parsed.status || message;
    } catch {
      // leave as-is
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  return blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
}

export async function updateApplicationAttachmentPdf(
  file: Blob | File,
  applicationId: string,
  fileId: string,
): Promise<{ status: string; fileId?: string }> {
  const form = new FormData();
  form.append('file', file, file instanceof File ? file.name : 'attachment.pdf');
  form.append('applicationId', applicationId);
  form.append('fileId', fileId);
  const res = await fetch(`${getServerURL()}/update-application-attachment-pdf`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json?.status !== 'SUCCESS') {
    throw new Error(json.message || json.error || res.statusText);
  }
  return json;
}

export async function updateProfileFromDirectives(
  directivesMap: Record<string, unknown>,
  clientUsername = '',
): Promise<{ status: string }> {
  const res = await fetch(`${getServerURL()}/update-profile-from-directives`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: clientUsername,
      directives: directivesMap,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.error || res.statusText);
  }
  return json;
}
