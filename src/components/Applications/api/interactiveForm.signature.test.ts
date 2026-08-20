import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getApplicationSignatures,
  saveApplicationSignature,
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
