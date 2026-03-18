import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import ApplicationPdfPreview from '../../../components/Applications/ApplicationPdfPreview';

vi.mock('../../../components/InteractiveForms/SignAndDownloadViewer', () => ({
  default: React.forwardRef((props: {
    showPdfEditControls?: boolean;
    pdfFormsReadOnly?: boolean;
  }, _ref) => (
    <div
      data-testid="mock-sign-viewer"
      data-show-pdf-edit-controls={String(Boolean(props.showPdfEditControls))}
      data-pdf-forms-read-only={String(Boolean(props.pdfFormsReadOnly))}
    />
  )),
}));

describe('ApplicationPdfPreview route modes', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      configurable: true,
      value: vi.fn(() => 'blob:mock-pdf-url'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      configurable: true,
      value: vi.fn(),
    });
    global.fetch = vi.fn(async () =>
      new Response(new Blob(['%PDF-1.7'], { type: 'application/pdf' }), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      })) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('preview route is read-only and shows Edit PDF button', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/applications/preview',
            state: {
              applicationId: '698cbd8a3f7a7169b05f0262',
              applicationFilename: 'Test.pdf',
              targetUser: 'client-user',
            },
          },
        ]}
      >
        <Route path="/applications/preview">
          <ApplicationPdfPreview editable={false} />
        </Route>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('mock-sign-viewer')).toBeInTheDocument());

    const viewer = screen.getByTestId('mock-sign-viewer');
    expect(viewer).toHaveAttribute('data-pdf-forms-read-only', 'true');
    expect(viewer).toHaveAttribute('data-show-pdf-edit-controls', 'false');
    expect(screen.getByRole('button', { name: 'Edit PDF' })).toBeInTheDocument();
  });

  test('edit route starts locked and enables controls after clicking Edit PDF', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/applications/edit',
            state: {
              applicationId: '698cbd8a3f7a7169b05f0262',
              applicationFilename: 'Test.pdf',
              targetUser: 'client-user',
            },
          },
        ]}
      >
        <Route path="/applications/edit">
          <ApplicationPdfPreview editable />
        </Route>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('mock-sign-viewer')).toBeInTheDocument());

    const viewer = screen.getByTestId('mock-sign-viewer');
    expect(viewer).toHaveAttribute('data-pdf-forms-read-only', 'true');
    expect(viewer).toHaveAttribute('data-show-pdf-edit-controls', 'false');
    expect(screen.getByRole('button', { name: 'Edit PDF' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Edit PDF' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(viewer).toHaveAttribute('data-pdf-forms-read-only', 'false');
  });
});
