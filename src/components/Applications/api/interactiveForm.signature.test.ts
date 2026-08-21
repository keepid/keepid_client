import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getApplicationAttachmentOptions,
  getApplicationSignatures,
  saveApplicationSignature,
  updateApplicationAttachmentOptions,
} from './interactiveForm';

const signatureState = {
  status: 'SUCCESS',
  applicationId: 'app-1',
  applicationState: 'AWAITING_SIGNATURE',
  signatures: [{
    key: 'applicant-signature',
    page: 0,
    rect: [10, 20, 100, 30],
    required: true,
    status: 'PENDING',
  }],
};

describe('durable application signature API', () => {
  afterEach(() => vi.restoreAllMocks());

  it('loads the snapshotted placements for a saved application', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(signatureState), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await getApplicationSignatures('app-1');

    expect(result.signatures[0].key).toBe('applicant-signature');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/get-application-signatures'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('uploads the signed PDF and stable placement key together', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        ...signatureState,
        applicationState: 'READY_TO_MAIL',
        signatures: [{ ...signatureState.signatures[0], status: 'SIGNED' }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    const result = await saveApplicationSignature(
      'app-1',
      'applicant-signature',
      new Blob(['%PDF-test'], { type: 'application/pdf' }),
    );

    expect(result.applicationState).toBe('READY_TO_MAIL');
    const request = fetchMock.mock.calls[0][1];
    expect(request?.body).toBeInstanceOf(FormData);
    const body = request?.body as FormData;
    expect(body.get('applicationId')).toBe('app-1');
    expect(body.get('placementKey')).toBe('applicant-signature');
  });
});

describe('application attachment option API', () => {
  afterEach(() => vi.restoreAllMocks());

  const attachmentState = {
    status: 'SUCCESS',
    options: [{
      key: 'template:birth-certificate',
      type: 'DOCUMENT_TEMPLATE' as const,
      label: 'Homeless Birth Certificate Request',
      description: 'Generated request letter',
      available: true,
      unavailableReason: null,
      selected: false,
    }, {
      key: 'photo:director',
      type: 'DIRECTOR_PHOTO_ID' as const,
      label: 'Director Photo ID',
      description: 'Director identification',
      available: true,
      unavailableReason: null,
      selected: false,
    }, {
      key: 'photo:client',
      type: 'CLIENT_PHOTO_ID' as const,
      label: 'Client Photo ID',
      description: 'Client identification',
      available: false,
      unavailableReason: 'Upload a Client Photo ID first.',
      selected: false,
    }],
    attachments: [],
  };

  it('loads only the server-curated packet choices', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(attachmentState), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await getApplicationAttachmentOptions('app-1');

    expect(result.options.map((option) => option.label)).toEqual([
      'Homeless Birth Certificate Request',
      'Director Photo ID',
      'Client Photo ID',
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/get-application-attachment-options'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends stable option keys instead of organization file IDs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        ...attachmentState,
        options: attachmentState.options.map((option) => ({
          ...option,
          selected: option.key !== 'photo:client',
        })),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );

    await updateApplicationAttachmentOptions('app-1', [
      'template:birth-certificate',
      'photo:director',
    ]);

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    expect(body).toEqual({
      applicationId: 'app-1',
      selectedOptionKeys: ['template:birth-certificate', 'photo:director'],
    });
  });
});
