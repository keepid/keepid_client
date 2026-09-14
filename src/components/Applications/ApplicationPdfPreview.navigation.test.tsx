// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ApplicationPdfPreview, { PreviewLocationState } from './ApplicationPdfPreview';
import ApplicationPreviewRoute from './ApplicationPreviewRoute';

vi.mock('../../serverOverride', () => ({ default: () => 'http://api.test' }));
vi.mock('react-alert', () => ({ useAlert: () => ({ error: vi.fn() }) }));
vi.mock('react-helmet', () => ({ Helmet: () => null }));
vi.mock('../Documents/MailModal', () => ({ MailConfirmation: () => null, MailModal: () => null }));
vi.mock('../InteractiveForms/SignAndDownloadViewer', async () => {
  const { forwardRef } = await import('react');
  return { default: forwardRef(() => <div>PDF preview</div>) };
});
vi.mock('./api/interactiveForm', () => ({
  getApplicationSignatures: async () => ({ signatures: [] }),
}));
vi.mock('./api/applicationMailStatus', () => ({
  getApplicationMailStatus: async () => ({ mailStatus: 'READY_TO_MAIL', mailedAt: null }),
  getApplicationMailDetailLabel: () => 'Ready to mail',
  setApplicationManuallyMailed: vi.fn(),
}));

const id = '12345678-1234-1234-1234-123456789abc';
const path = `/applications/preview?applicationId=${id}`;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    headers: new Headers({ 'content-type': 'application/pdf' }),
    blob: async () => new Blob(['test PDF']),
  }));
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = () => 'blob:test-pdf';

    static revokeObjectURL = () => {};
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function openPreview(details: PreviewLocationState, navigationState = false) {
  const history = createMemoryHistory({ initialEntries: [{ pathname: '/applications/preview', state: details }] });
  render(
    <Router history={history}>
      <ApplicationPdfPreview applicationDetails={navigationState ? undefined : { applicationId: id, ...details }} />
    </Router>,
  );
  if (!navigationState || details.applicationId) await screen.findByText('PDF preview');
  return history;
}

describe('application preview profile navigation', () => {
  it('links to the applicant, not the uploader or another target, with a URL-encoded username', async () => {
    const history = await openPreview({
      clientUsername: 'client+one@example.com',
      targetUser: 'other-target',
      uploadedByName: 'Demo Worker',
    });
    const profileLink = screen.getByRole('link', { name: 'Back to Profile' });
    expect(profileLink.getAttribute('href')).toBe('/profile/client%2Bone%40example.com');
    fireEvent.click(profileLink);
    expect(history.location.pathname).toBe('/profile/client%2Bone%40example.com');
  });

  it('supports the client target from legacy navigation state', async () => {
    await openPreview({ applicationId: id, targetUser: 'demo-client' }, true);
    expect(screen.getByRole('link', { name: 'Back to Profile' }).getAttribute('href'))
      .toBe('/profile/demo-client');
  });

  it('does not guess a profile when client metadata is missing', async () => {
    const history = await openPreview({});
    expect(screen.queryByRole('link', { name: 'Back to Profile' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back to Applications' }));
    expect(history.location.pathname).toBe('/applications');
  });

  it('hydrates the profile link from a fresh application URL without navigation state', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id, title: 'PA Housed Birth Certificate', clientUsername: 'demo-client' }),
    } as Response);
    const history = createMemoryHistory({ initialEntries: [path] });
    render(<Router history={history}><ApplicationPreviewRoute /></Router>);
    await waitFor(() => expect(screen.getByRole('link', { name: 'Back to Profile' }).getAttribute('href'))
      .toBe('/profile/demo-client'));
    await screen.findByText('PDF preview');
    fireEvent.click(screen.getByRole('link', { name: 'Back to Profile' }));
    expect(history.location.pathname).toBe('/profile/demo-client');
  });
});
