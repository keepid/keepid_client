/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getApplicationAttachmentOptions,
  renderApplicationPacket,
  updateApplicationAttachmentPdf,
  uploadCompletedPdf,
} from '../Applications/api/interactiveForm';
import SignAndDownloadViewer from './SignAndDownloadViewer';

vi.mock('react-alert', () => ({ useAlert: () => ({ error: vi.fn() }) }));
vi.mock('../Documents/MailModal', () => ({ MailConfirmation: () => null, MailModal: () => null }));
vi.mock('../Applications/api/interactiveForm', () => ({
  getApplicationAttachmentOptions: vi.fn(),
  renderApplicationPacket: vi.fn(),
  saveApplicationSignature: vi.fn(),
  updateApplicationAttachmentOptions: vi.fn(),
  updateApplicationAttachmentPdf: vi.fn(),
  uploadCompletedPdf: vi.fn(),
}));
vi.mock('react-pdf', async () => {
  const react = await import('react');
  return {
    pdfjs: {
      GlobalWorkerOptions: {},
      getDocument: () => ({ promise: Promise.resolve({ numPages: 1 }) }),
    },
    Document: ({ children, onLoadSuccess }: {
      children: React.ReactNode;
      onLoadSuccess: (pdf: { numPages: number; saveDocument: () => Promise<Uint8Array> }) => void;
    }) => {
      react.useEffect(() => {
        onLoadSuccess({ numPages: 1, saveDocument: async () => new Uint8Array([1, 2, 3]) });
      }, [onLoadSuccess]);
      return <div>{children}</div>;
    },
    Page: () => <div>PDF page</div>,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('ResizeObserver', class {
    observe() {}

    disconnect() {}
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(3) }));
  URL.createObjectURL = vi.fn(() => 'blob:attachment');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  vi.mocked(getApplicationAttachmentOptions).mockResolvedValue({
    status: 'SUCCESS',
    options: [],
    attachments: [{ fileId: 'attachment-1', filename: 'letter.pdf' }],
    hasMainPdf: false,
  });
  vi.mocked(renderApplicationPacket).mockResolvedValue(new Blob(['packet']));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('attachments-only PDF packets', () => {
  const openViewer = (editing = false) => render(
    <SignAndDownloadViewer
      fileUrl="blob:first-document"
      applicationId="packet"
      signaturePlacements={[]}
      formAnswers={{}}
      showSaveButton={false}
      showPdfEditControls
      startInEditMode={editing}
      canEditAttachments
    />,
  );

  it('shows the attachment once and exports without a main-PDF override', async () => {
    openViewer();
    await screen.findByText('Attachment pages: 1');
    expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Download filled PDF' }));
    await waitFor(() => expect(renderApplicationPacket).toHaveBeenCalledWith('packet'));
  });

  it('saves PDF edits to the attachment instead of creating a primary form', async () => {
    openViewer(true);
    await screen.findByText('Attachment pages: 1');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(updateApplicationAttachmentPdf)
      .toHaveBeenCalledWith(expect.any(Blob), 'packet', 'attachment-1'));
    expect(uploadCompletedPdf).not.toHaveBeenCalled();
  });

  it('does not download an incomplete first-document fallback when packet export fails', async () => {
    vi.mocked(renderApplicationPacket).mockRejectedValue(new Error('Please retry'));
    openViewer();
    await screen.findByText('Attachment pages: 1');
    fireEvent.click(screen.getByRole('button', { name: 'Download filled PDF' }));
    await screen.findByText("Couldn't download the attachment packet: Please retry");
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });
});
