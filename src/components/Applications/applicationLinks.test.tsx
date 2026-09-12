// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ApplicationLinkReturn from './ApplicationLinkReturn';
import { APPLICATION_RETURN_KEY, applicationReturnPath } from './applicationLinks';
import ApplicationPreviewRoute from './ApplicationPreviewRoute';

vi.mock('../../serverOverride', () => ({ default: () => 'http://api.test' }));
vi.mock('./ApplicationPdfPreview', () => ({
  default: ({ applicationDetails }: { applicationDetails: unknown }) => (
    <div data-testid="preview">{JSON.stringify(applicationDetails)}</div>
  ),
}));
const id = '12345678-1234-1234-1234-123456789abc';
const path = `/applications/preview?applicationId=${id}`;
afterEach(() => { cleanup(); sessionStorage.clear(); vi.unstubAllGlobals(); });

describe('application URLs', () => {
  it('only permits known application routes and UUIDs for login returns', () => {
    expect(applicationReturnPath('/applications/preview', `?applicationId=${id}&client=ignored`)).toBe(path);
    expect(applicationReturnPath('//evil.invalid', `?applicationId=${id}`)).toBeNull();
    expect(applicationReturnPath('/applications/preview', '?applicationId=not-an-id')).toBeNull();
    expect(applicationReturnPath('/home', `?applicationId=${id}`)).toBeNull();
  });

  it('returns to the application after authentication is confirmed and consumes the target', async () => {
    sessionStorage.setItem(APPLICATION_RETURN_KEY, path);
    const history = createMemoryHistory({ initialEntries: ['/home'] });
    const view = render(<Router history={history}><ApplicationLinkReturn authenticated ready={false} /></Router>);
    expect(history.location.pathname).toBe('/home');
    view.rerender(<Router history={history}><ApplicationLinkReturn authenticated ready /></Router>);
    await waitFor(() => expect(history.location.pathname + history.location.search).toBe(path));
    await waitFor(() => expect(sessionStorage.getItem(APPLICATION_RETURN_KEY)).toBeNull());
  });

  it('hydrates a fresh link from authorized backend metadata without navigation state', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true,
      json: async () => ({
        id,
        title: 'PA Housed Birth Certificate',
        clientUsername: 'demo-client',
        clientFirstName: 'Demo',
        clientLastName: 'Client',
        createdByFirstName: 'Demo',
        createdByLastName: 'Worker',
        createdAt: '2026-09-10T14:00:00Z',
        updatedAt: '2026-09-11T14:00:00Z',
        mailStatus: 'MAILED_MANUALLY',
      }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<Router history={createMemoryHistory({ initialEntries: [path] })}><ApplicationPreviewRoute /></Router>);
    expect(await screen.findByTestId('preview')).toBeTruthy();
    expect(screen.getByTestId('preview').textContent).toContain('Demo Client');
    expect(screen.getByTestId('preview').textContent).toContain('MAILED_MANUALLY');
    expect(fetchMock).toHaveBeenCalledWith(
      `http://api.test/api/applications/${id}`,
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('does not render a PDF or mail controls for an unavailable or forbidden ID', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(<Router history={createMemoryHistory({ initialEntries: [path] })}><ApplicationPreviewRoute /></Router>);
    await screen.findByText('This application is unavailable or you do not have access.');
    expect(screen.queryByTestId('preview')).toBeNull();
  });

  it('rejects malformed links without making a request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<Router history={createMemoryHistory({ initialEntries: ['/applications/preview?applicationId=bad'] })}><ApplicationPreviewRoute /></Router>);
    expect(screen.getByText('This application link is invalid.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
