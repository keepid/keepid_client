import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './sign-and-download-viewer.css';

import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PDFDocument } from 'pdf-lib';
// eslint-disable-next-line import/no-unresolved -- Vite ?url asset import
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import { Document, Page, pdfjs } from 'react-pdf';

import getServerURL from '../../serverOverride';
import {
  type ApplicationAttachmentOption,
  getApplicationAttachmentOptions,
  renderApplicationPacket,
  saveApplicationSignature,
  updateApplicationAttachmentOptions,
  updateApplicationAttachmentPdf,
  uploadCompletedPdf,
} from '../Applications/api/interactiveForm';
import { MailConfirmation, MailModal } from '../Documents/MailModal';
import type { SignaturePlacement } from './types';

// Vite-friendly pdf.js worker resolution. See the `?url` import above.
//
// `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` works in
// `npm run dev` (Vite serves the worker from node_modules via the module
// graph) but is brittle in `npm run build` — Vite's prod rollup does not
// reliably emit the bare-specifier worker as an asset, so `workerSrc`
// silently 404s in production. pdf.js then falls back to a "fake worker"
// mode that can't render and produces no console error, surfacing only
// as a blank PDF viewer. The `?url` import suffix tells Vite explicitly:
// copy this file into the build output and give me its hashed asset URL.
// Resolves identically in dev and prod.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface SignAndDownloadViewerProps {
  fileUrl: string;
  signaturePlacements: SignaturePlacement[];
  title?: string;
  applicationId: string;
  formAnswers: Record<string, unknown>;
  clientUsername?: string;
  onSaveSuccess?: () => void | Promise<void>;
  onSignatureStateChange?: (applicationState: string) => void;
  showSaveButton?: boolean;
  showPdfEditControls?: boolean;
  pdfFormsReadOnly?: boolean;
  startInEditMode?: boolean;
  canEditAttachments?: boolean;
}

export interface SignAndDownloadViewerHandle {
  savePdfEdits: () => Promise<boolean>;
  discardPdfEdits: () => void;
}

type AttachmentPreviewDoc = { id: string; sourceFileId: string; url: string; filename: string; pageCount: number };

const SignAndDownloadViewer = React.forwardRef<SignAndDownloadViewerHandle, SignAndDownloadViewerProps>(({
  fileUrl,
  signaturePlacements,
  title,
  applicationId,
  formAnswers,
  clientUsername = '',
  onSaveSuccess,
  onSignatureStateChange,
  showSaveButton = true,
  showPdfEditControls = false,
  pdfFormsReadOnly = false,
  startInEditMode = false,
  canEditAttachments = false,
}, ref) => {
  const FRAME_MAX_WIDTH_CLASS = 'tw-max-w-4xl';
  const [numPages, setNumPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const sigPadAreaRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(560);
  const [currentSigDataUrl, setCurrentSigDataUrl] = useState<string | null>(null);
  const currentSigRef = useRef<string | null>(null);
  currentSigRef.current = currentSigDataUrl;
  const [sigExpandModalOpen, setSigExpandModalOpen] = useState(false);
  const [modalPadCssHeight, setModalPadCssHeight] = useState(320);
  /** Hydrates inline pad after modal close; not updated on every stroke (avoids wiping the canvas). */
  const [inlineSigRestoreUrl, setInlineSigRestoreUrl] = useState<string | null>(null);
  /** Snapshot when opening expanded pad; stable while drawing in the modal. */
  const [modalSigSnapshot, setModalSigSnapshot] = useState<string | null>(null);
  const alert = useAlert();
  const [mailDialogIsOpen, setMailDialogIsOpen] = useState(false);
  const [showMailSuccess, setShowMailSuccess] = useState(false);
  const [activePlacementIdx, setActivePlacementIdx] = useState<number | null>(null);
  const [livePdfUrl, setLivePdfUrl] = useState<string>(fileUrl);
  const [embeddedBoxes, setEmbeddedBoxes] = useState<Set<number>>(
    () => new Set(signaturePlacements
      .map((placement, index) => (placement.status === 'SIGNED' ? index : -1))
      .filter((index) => index >= 0)),
  );
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Application packet options. These are server-curated published templates and photo IDs,
  // never the organization's raw asset uploads.
  const [attachmentOptions, setAttachmentOptions] = useState<ApplicationAttachmentOption[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [stagedDocs, setStagedDocs] = useState<Set<string>>(new Set());
  const [isAppendingDocs, setIsAppendingDocs] = useState(false);
  const [attachmentPreviewDocs, setAttachmentPreviewDocs] = useState<AttachmentPreviewDoc[]>([]);
  const [savingPdfEdits, setSavingPdfEdits] = useState(false);
  /** Tracks which export button (if any) is currently building a combined PDF, so we can
   * disable both buttons and show a "Preparing..." label. Prevents rage-clicks from spawning
   * duplicate flatten+merge passes. */
  const [preparingExport, setPreparingExport] = useState<null | 'download' | 'print'>(null);
  const [pdfEditSavedMessage, setPdfEditSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPdfEditMode, setIsPdfEditMode] = useState(startInEditMode);
  const [sigOverlays, setSigOverlays] = useState<{ left: number; top: number; width: number; height: number; placementIdx: number }[]>([]);
  const [pdfVersion, setPdfVersion] = useState(0);
  const [frameElement, setFrameElement] = useState<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<{ saveDocument:() => Promise<Uint8Array> } | null>(null);
  const attachmentPdfDocRef = useRef<{ saveDocument:() => Promise<Uint8Array> } | null>(null);

  const handleSignatureChange = useCallback((url: string | null) => {
    setCurrentSigDataUrl(url);
    if (url === null) setInlineSigRestoreUrl(null);
  }, []);

  useEffect(() => {
    setEmbeddedBoxes(new Set(signaturePlacements
      .map((placement, index) => (placement.status === 'SIGNED' ? index : -1))
      .filter((index) => index >= 0)));
  }, [signaturePlacements]);

  const openSigExpandModal = useCallback(() => {
    setModalSigSnapshot(currentSigRef.current);
    setSigExpandModalOpen(true);
  }, []);

  const closeSigExpandModal = useCallback((restoreCurrentSignature = true) => {
    setSigExpandModalOpen(false);
    setInlineSigRestoreUrl(restoreCurrentSignature ? currentSigRef.current : null);
  }, []);

  const handleFrameRef = useCallback((node: HTMLDivElement | null) => {
    frameRef.current = node;
    setFrameElement(node);
  }, []);

  useEffect(() => {
    const el = frameElement;
    if (!el) return undefined;
    const updateWidth = () => {
      if (el.clientWidth > 0) setFrameWidth(el.clientWidth);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameElement]);

  useEffect(() => {
    const updateModalPadHeight = () => {
      setModalPadCssHeight(Math.min(520, Math.max(240, Math.round(window.innerHeight * 0.52))));
    };
    updateModalPadHeight();
    window.addEventListener('resize', updateModalPadHeight);
    return () => window.removeEventListener('resize', updateModalPadHeight);
  }, []);

  useEffect(() => {
    if (!sigExpandModalOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sigExpandModalOpen]);

  useEffect(() => {
    if (!sigExpandModalOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSigExpandModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sigExpandModalOpen, closeSigExpandModal]);
  const renderedWidth = Math.max(100, frameWidth - 2);
  const pageDevicePixelRatio = typeof window === 'undefined'
    ? 2
    : Math.max(window.devicePixelRatio || 1, 2);
  const pdfWidgetsEditable = !pdfFormsReadOnly || (showPdfEditControls && isPdfEditMode);
  const effectivePdfFormsReadOnly = !pdfWidgetsEditable;
  /*
   * Keep pdf.js in charge of AcroForm widget layout in both edit and
   * read-only preview. The PDF's saved appearance streams can be stale or
   * vertically clipped; pdf.js reads the current form values directly.
   */
  const renderPdfFormWidgets = true;

  const signedCount = embeddedBoxes.size;
  const allSigned = signaturePlacements.length === 0 || signedCount === signaturePlacements.length;
  const toPdfBlob = (bytes: Uint8Array) => {
    const arrayBuffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(arrayBuffer).set(bytes);
    return new Blob([arrayBuffer], { type: 'application/pdf' });
  };

  const activeRect = activePlacementIdx !== null ? signaturePlacements[activePlacementIdx]?.rect : null;
  const padAspect = activeRect ? activeRect[2] / activeRect[3] : 4;
  const PAD_CSS_HEIGHT = 100;
  const PAD_RESOLUTION_SCALE = 3;
  const padCanvasH = Math.round(PAD_CSS_HEIGHT * PAD_RESOLUTION_SCALE);
  const padCanvasW = Math.round(padCanvasH * padAspect);
  const modalPadCanvasH = Math.round(modalPadCssHeight * PAD_RESOLUTION_SCALE);
  const modalPadCanvasW = Math.round(modalPadCanvasH * padAspect);

  const onPageLoadForOverlays = useCallback(
    (page: any) => {
      const baseVp = page.getViewport({ scale: 1, rotation: page.rotate });
      const pageElement = pdfWrapperRef.current?.querySelector('.react-pdf__Page') as HTMLElement | null;
      const pageCanvas = pageElement?.querySelector('canvas') as HTMLCanvasElement | null;
      const displayedPageWidth = pageCanvas?.clientWidth || (renderedWidth > 0 ? renderedWidth : baseVp.width);
      const sf = displayedPageWidth / baseVp.width;
      const vp = page.getViewport({ scale: sf, rotation: page.rotate });
      let offsetLeft = 0;
      let offsetTop = 0;
      if (pageElement && pdfWrapperRef.current) {
        const pageRect = pageElement.getBoundingClientRect();
        const wrapperRect = pdfWrapperRef.current.getBoundingClientRect();
        offsetLeft = pageRect.left - wrapperRect.left;
        offsetTop = pageRect.top - wrapperRect.top;
      }
      const pageIndex = typeof page.pageIndex === 'number' ? page.pageIndex : pageNum - 1;
      const rects = signaturePlacements
        .map((p, idx) => ({ p, idx }))
        .filter(({ p }) => p.page === pageIndex)
        .map(({ p, idx }) => {
          const [x, y, pw, ph] = p.rect;
          const [vx1, vy1, vx2, vy2] = vp.convertToViewportRectangle([x, y, x + pw, y + ph]);
          return {
            left: Math.min(vx1, vx2) + offsetLeft,
            top: Math.min(vy1, vy2) + offsetTop,
            width: Math.abs(vx2 - vx1),
            height: Math.abs(vy2 - vy1),
            placementIdx: idx,
          };
        });
      setSigOverlays(rects);
    },
    [renderedWidth, signaturePlacements, pageNum],
  );

  const loadAttachmentPreviews = useCallback(async (
    attachments: Array<{ fileId: string; filename: string }>,
  ) => {
    if (attachments.length === 0) {
      setAttachmentPreviewDocs((prev) => {
        prev.forEach((entry) => URL.revokeObjectURL(entry.url));
        return [];
      });
      return;
    }

    const nextPreviewDocs: AttachmentPreviewDoc[] = [];
    for (let i = 0; i < attachments.length; i += 1) {
      const attachment = attachments[i];
      /* eslint-disable-next-line no-await-in-loop */
      const res = await fetch(`${getServerURL()}/download-file`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: attachment.fileId, fileType: 'APPLICATION_PDF' }),
      });
      if (res.ok) {
        /* eslint-disable-next-line no-await-in-loop */
        const rawBytes = await res.arrayBuffer();
        const pageCountBytes = rawBytes.slice(0);
        const previewBytes = rawBytes.slice(0);
        /* eslint-disable-next-line no-await-in-loop */
        const pageCount = await pdfjs.getDocument({ data: pageCountBytes }).promise
          .then((pdf) => pdf.numPages)
          .catch(() => 0);
        const url = URL.createObjectURL(new Blob([previewBytes], { type: 'application/pdf' }));
        nextPreviewDocs.push({
          id: attachment.fileId,
          sourceFileId: attachment.fileId,
          url,
          filename: attachment.filename,
          pageCount,
        });
      }
    }
    setAttachmentPreviewDocs((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return nextPreviewDocs;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initAttachmentOptions() {
      try {
        const state = await getApplicationAttachmentOptions(applicationId);
        if (cancelled) return;
        const selected = new Set(
          state.options.filter((option) => option.selected).map((option) => option.key),
        );
        setAttachmentOptions(state.options);
        setSelectedDocs(selected);
        setStagedDocs(new Set(selected));
        await loadAttachmentPreviews(state.attachments);
      } catch (err) {
        console.error('Failed to load application attachment options', err);
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : 'Could not load attachment options.');
        }
      }
    }
    initAttachmentOptions();
    return () => {
      cancelled = true;
    };
  }, [applicationId, loadAttachmentPreviews]);

  useEffect(() => {
    if (signaturePlacements.length > 0 && activePlacementIdx === null) {
      const firstUnsigned = signaturePlacements.findIndex((_, i) => !embeddedBoxes.has(i));
      if (firstUnsigned >= 0) {
        setActivePlacementIdx(firstUnsigned);
        setPageNum(signaturePlacements[firstUnsigned].page + 1);
      }
    }
  }, [signaturePlacements, activePlacementIdx, embeddedBoxes]);

  const selectBox = useCallback((idx: number) => {
    if (embeddedBoxes.has(idx)) return;
    setActivePlacementIdx(idx);
    setCurrentSigDataUrl(null);
    setInlineSigRestoreUrl(null);
    setModalSigSnapshot(null);
    setSigExpandModalOpen(false);
    setPageNum(signaturePlacements[idx].page + 1);
    requestAnimationFrame(() => sigPadAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }, [embeddedBoxes, signaturePlacements]);

  const handleEmbedSignature = useCallback(async (): Promise<boolean> => {
    if (activePlacementIdx === null || !currentSigDataUrl) return false;
    setApplying(true);
    try {
      let pdfBytes: ArrayBuffer | Uint8Array;
      if (pdfWidgetsEditable && pdfDocRef.current?.saveDocument) {
        pdfBytes = await pdfDocRef.current.saveDocument();
      } else {
        pdfBytes = await fetch(livePdfUrl).then((r) => r.arrayBuffer());
      }
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const imgBytes = await fetch(currentSigDataUrl).then((r) => r.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(imgBytes);
      const p = signaturePlacements[activePlacementIdx];
      const page = pdfDoc.getPage(p.page);
      const [x, y, w, h] = p.rect;
      const imgAspect = sigImage.width / sigImage.height;
      const boxAspect = w / h;
      // Keep a little breathing room so signatures do not run end-to-end in the PDF box.
      const EMBED_FILL_RATIO = 0.88;
      const maxDrawW = w * EMBED_FILL_RATIO;
      const maxDrawH = h * EMBED_FILL_RATIO;
      const maxAspect = maxDrawW / maxDrawH;
      let drawW = maxDrawW;
      let drawH = maxDrawH;
      if (imgAspect > maxAspect) {
        drawH = maxDrawW / imgAspect;
      } else {
        drawW = maxDrawH * imgAspect;
      }
      page.drawImage(sigImage, { x: x + (w - drawW) / 2, y: y + (h - drawH) / 2, width: drawW, height: drawH });
      const bytes = await pdfDoc.save();
      const blob = toPdfBlob(bytes);
      const placementKey = p.key || `signature-${activePlacementIdx + 1}`;
      const signatureState = await saveApplicationSignature(applicationId, placementKey, blob);
      onSignatureStateChange?.(signatureState.applicationState);
      const oldUrl = livePdfUrl;
      const newUrl = URL.createObjectURL(blob);
      setLivePdfUrl(newUrl);
      setPdfVersion((v) => v + 1);
      if (oldUrl !== fileUrl) URL.revokeObjectURL(oldUrl);
      setEmbeddedBoxes((prev) => new Set(prev).add(activePlacementIdx));
      setCurrentSigDataUrl(null);
      setInlineSigRestoreUrl(null);
      setModalSigSnapshot(null);
      const nextUnsigned = signaturePlacements.findIndex((_, i) => i !== activePlacementIdx && !embeddedBoxes.has(i));
      if (nextUnsigned >= 0) {
        setActivePlacementIdx(nextUnsigned);
        setPageNum(signaturePlacements[nextUnsigned].page + 1);
      } else {
        setActivePlacementIdx(null);
      }
      setPdfEditSavedMessage('Signature saved.');
      setSaveError(null);
      return true;
    } catch (err) {
      console.error('Failed to embed signature', err);
      setSaveError(err instanceof Error ? err.message : 'Could not save signature. Please try again.');
      return false;
    } finally {
      setApplying(false);
    }
  }, [activePlacementIdx, applicationId, currentSigDataUrl, livePdfUrl, fileUrl, signaturePlacements, embeddedBoxes, onSignatureStateChange, pdfWidgetsEditable]);

  const toggleStagedDoc = useCallback((docId: string) => {
    setStagedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  }, []);

  const composeWithSelection = useCallback(async (nextSelected: Set<string>) => {
    setIsAppendingDocs(true);
    try {
      const state = await updateApplicationAttachmentOptions(
        applicationId,
        Array.from(nextSelected),
      );
      const effectiveSelected = new Set(
        state.options.filter((option) => option.selected).map((option) => option.key),
      );
      setAttachmentOptions(state.options);
      setSelectedDocs(effectiveSelected);
      setStagedDocs(new Set(effectiveSelected));
      await loadAttachmentPreviews(state.attachments);
      setSaveError(null);
    } catch (err) {
      console.error('Failed to append doc', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to apply attachment changes');
    } finally {
      setIsAppendingDocs(false);
    }
  }, [applicationId, loadAttachmentPreviews]);

  const applyOrgDocs = useCallback(async () => {
    const nextSelected = new Set(stagedDocs);
    await composeWithSelection(nextSelected);
  }, [composeWithSelection, stagedDocs]);
  const hasAttachmentSelectionChanges =
    stagedDocs.size !== selectedDocs.size
    || Array.from(stagedDocs).some((id) => !selectedDocs.has(id));

  useEffect(() => () => {
    setAttachmentPreviewDocs((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return [];
    });
  }, []);

  const totalAttachedPages = attachmentPreviewDocs.reduce((sum, doc) => sum + doc.pageCount, 0);
  const combinedViewerDocs = useMemo(
    () => [
      { id: 'main', url: livePdfUrl, pageCount: numPages, kind: 'main' as const },
      ...attachmentPreviewDocs
        .filter((doc) => doc.pageCount > 0)
        .map((doc) => ({
          id: doc.id,
          sourceFileId: doc.sourceFileId,
          url: doc.url,
          pageCount: doc.pageCount,
          kind: 'attachment' as const,
        })),
    ],
    [attachmentPreviewDocs, livePdfUrl, numPages],
  );
  const totalViewerPages = useMemo(
    () => combinedViewerDocs.reduce((sum, doc) => sum + doc.pageCount, 0),
    [combinedViewerDocs],
  );
  const currentViewerPageMeta = useMemo(() => {
    let remaining = pageNum;
    for (let i = 0; i < combinedViewerDocs.length; i += 1) {
      const doc = combinedViewerDocs[i];
      if (remaining <= doc.pageCount) {
        return { doc, localPage: remaining };
      }
      remaining -= doc.pageCount;
    }
    const fallbackDoc = combinedViewerDocs[0];
    return { doc: fallbackDoc, localPage: 1 };
  }, [combinedViewerDocs, pageNum]);
  const isViewingMainPdf = currentViewerPageMeta.doc.kind === 'main';
  const canEditCurrentAttachment =
    currentViewerPageMeta.doc.kind === 'attachment' && canEditAttachments && !effectivePdfFormsReadOnly;

  const getMainPdfBytes = useCallback(async (): Promise<Uint8Array> => {
    const shouldUseSaveDocument = pdfWidgetsEditable && !!pdfDocRef.current?.saveDocument && pageNum <= numPages;
    if (shouldUseSaveDocument && pdfDocRef.current?.saveDocument) {
      try {
        return await pdfDocRef.current.saveDocument();
      } catch {
        // fall through to fetch
      }
    }
    const res = await fetch(livePdfUrl);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }, [livePdfUrl, numPages, pageNum, pdfWidgetsEditable]);

  const getCurrentPdfBlob = useCallback(async (): Promise<Blob> => {
    const bytes = await getMainPdfBytes();
    return toPdfBlob(bytes);
  }, [getMainPdfBytes]);

  const getCurrentAttachmentPdfBlob = useCallback(async (): Promise<Blob> => {
    if (attachmentPdfDocRef.current?.saveDocument && canEditCurrentAttachment) {
      const bytes = await attachmentPdfDocRef.current.saveDocument();
      return toPdfBlob(bytes);
    }
    const response = await fetch(currentViewerPageMeta.doc.url);
    const bytes = await response.arrayBuffer();
    return new Blob([bytes], { type: 'application/pdf' });
  }, [canEditCurrentAttachment, currentViewerPageMeta.doc.url]);

  /**
   * Builds the bytes that downstream viewers see on Print/Download by delegating the merge +
   * flatten + appearance-normalize pipeline to the server. The server uses the exact same
   * RenderPacketPdfService that Lob mails as-is; Lob uses insert_blank_page for the address sheet.
   *
   * <p>We capture the client-side live state (pdf.js in-memory form widget edits and any
   * current signature state) by sending the current main PDF bytes as
   * an override -- the server uses those bytes as the APPLICATION_BASE part, fetches attachment
   * parts from storage, and flattens everything with PDFBox. The override is not persisted;
   * the final finish action remains an explicit commit path for any form-widget edits.
   *
   * <p>This replaces the previous pdf-lib client-side flatten + copyPages pipeline, which
   * couldn't produce deterministic field appearances (pdf-lib's text appearance provider
   * overrode our sizing), produced orphan widgets when merging attachments unless we flattened
   * them first, and cost hundreds of ms of main-thread CPU per click. Moving the work to the
   * server (which has real Helvetica metrics via PDFBox + a single normalization pass) produces
   * smaller, more print-friendly bytes too, which measurably speeds up Chromium's print
   * preview render.
   */
  const getRenderedPacketBlob = useCallback(async (): Promise<Blob> => {
    const mainBytes = await getMainPdfBytes();
    const mainOverride = toPdfBlob(mainBytes);
    return renderApplicationPacket(applicationId, mainOverride);
  }, [applicationId, getMainPdfBytes]);

  const handlePrint = useCallback(() => {
    if (preparingExport !== null) return;
    setPreparingExport('print');
    // Open a tab synchronously on click so we keep user activation after async blob work.
    // (window.open after await is often blocked; a 0×0 iframe often fails to print PDFs.)
    const printWindow = window.open('about:blank', '_blank');
    if (printWindow && !printWindow.closed) {
      try {
        // Show a placeholder so the popup isn't a stark white page during the build.
        printWindow.document.title = 'Preparing PDF for print...';
        printWindow.document.body.innerHTML = (
          '<div style="font-family:system-ui,sans-serif;color:#475569;padding:24px;font-size:14px;">'
          + 'Preparing PDF for print...'
          + '</div>'
        );
      } catch {
        // Cross-origin or about:blank quirks -- non-fatal, the navigation below replaces it.
      }
    }

    const printWithIframe = (objectUrl: string) => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      Object.assign(iframe.style, {
        position: 'fixed',
        top: '0',
        left: '-9999px',
        width: '1024px',
        height: '768px',
        border: '0',
        opacity: '0',
        pointerEvents: 'none',
      });
      iframe.src = objectUrl;
      document.body.appendChild(iframe);
      const cleanup = () => {
        iframe.remove();
        URL.revokeObjectURL(objectUrl);
      };
      const trigger = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          window.setTimeout(cleanup, 1000);
        }
      };
      iframe.onload = () => window.setTimeout(trigger, 300);
    };

    (async () => {
      let objectUrl: string | null = null;
      try {
        const blob = await getRenderedPacketBlob();
        objectUrl = URL.createObjectURL(blob);

        if (printWindow && !printWindow.closed) {
          printWindow.location.href = objectUrl;
          let printScheduled = false;
          const schedulePrint = () => {
            if (printScheduled || printWindow.closed) return;
            printScheduled = true;
            window.setTimeout(() => {
              try {
                printWindow.focus();
                printWindow.print();
              } catch (printErr) {
                console.error('printWindow.print() threw', printErr);
              }
            }, 300);
          };
          printWindow.addEventListener('load', schedulePrint, { once: true });
          window.setTimeout(schedulePrint, 1500);
          return;
        }

        printWithIframe(objectUrl);
      } catch (err) {
        console.error('Print failed while building combined PDF', err);
        setSaveError(
          err instanceof Error
            ? `Couldn't prepare PDF for print: ${err.message}`
            : "Couldn't prepare PDF for print.",
        );
        printWindow?.close();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } finally {
        setPreparingExport((current) => (current === 'print' ? null : current));
      }
    })().catch((err) => {
      console.error('Print outer promise rejected', err);
    });
  }, [getRenderedPacketBlob, preparingExport]);

  const handleDownload = useCallback(async () => {
    if (preparingExport !== null) return;
    setPreparingExport('download');
    try {
      const blob = await getRenderedPacketBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'signed'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed; falling back to unmerged main PDF', err);
      // Surface the failure so the user knows why the download lacks attachments -- otherwise
      // the fallback looks like a silent regression in the attachment-merge feature.
      setSaveError(
        err instanceof Error
          ? `Couldn't build the combined PDF (${err.message}). Downloaded the main application without attachments as a fallback.`
          : "Couldn't build the combined PDF. Downloaded the main application without attachments as a fallback.",
      );
      const a = document.createElement('a');
      a.href = livePdfUrl;
      a.download = `${title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'signed'}.pdf`;
      a.click();
    } finally {
      setPreparingExport((current) => (current === 'download' ? null : current));
    }
  }, [livePdfUrl, title, getRenderedPacketBlob, preparingExport]);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setSaving(true);
    try {
      if (currentViewerPageMeta.doc.kind === 'attachment') {
        if (!canEditAttachments || effectivePdfFormsReadOnly) {
          throw new Error('Attachment editing is not available in this mode.');
        }
        const attachmentFileId = currentViewerPageMeta.doc.id;
        const attachmentBlob = await getCurrentAttachmentPdfBlob();
        await updateApplicationAttachmentPdf(attachmentBlob, applicationId, attachmentFileId);
        const updatedPageCount = await pdfjs
          .getDocument({ data: await attachmentBlob.arrayBuffer() })
          .promise
          .then((pdf) => pdf.numPages)
          .catch(() => 0);
        const updatedUrl = URL.createObjectURL(attachmentBlob);
        setAttachmentPreviewDocs((prev) =>
          prev.map((entry) => {
            if (entry.id !== attachmentFileId) return entry;
            URL.revokeObjectURL(entry.url);
            return { ...entry, url: updatedUrl, pageCount: updatedPageCount || entry.pageCount };
          }));
        setPdfVersion((v) => v + 1);
      }
      const blob = await getCurrentPdfBlob();
      await uploadCompletedPdf(blob, applicationId, formAnswers, clientUsername);
      await onSaveSuccess?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save application');
    } finally {
      setSaving(false);
    }
  }, [
    applicationId,
    canEditAttachments,
    clientUsername,
    currentViewerPageMeta.doc,
    formAnswers,
    getCurrentAttachmentPdfBlob,
    getCurrentPdfBlob,
    onSaveSuccess,
    effectivePdfFormsReadOnly,
  ]);

  const handleSavePdfEdits = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    setPdfEditSavedMessage(null);
    setSavingPdfEdits(true);
    try {
      if (currentViewerPageMeta.doc.kind === 'attachment') {
        if (!canEditAttachments || effectivePdfFormsReadOnly) {
          throw new Error('Attachment editing is not available in this mode.');
        }
        const attachmentFileId = currentViewerPageMeta.doc.id;
        const blob = await getCurrentAttachmentPdfBlob();
        await updateApplicationAttachmentPdf(blob, applicationId, attachmentFileId);
        const updatedPageCount = await pdfjs
          .getDocument({ data: await blob.arrayBuffer() })
          .promise
          .then((pdf) => pdf.numPages)
          .catch(() => 0);
        const updatedUrl = URL.createObjectURL(blob);
        setAttachmentPreviewDocs((prev) =>
          prev.map((entry) => {
            if (entry.id !== attachmentFileId) return entry;
            URL.revokeObjectURL(entry.url);
            return { ...entry, url: updatedUrl, pageCount: updatedPageCount || entry.pageCount };
          }));
        setPdfVersion((v) => v + 1);
        setIsPdfEditMode(false);
        setPdfEditSavedMessage('Attachment changes saved.');
        return true;
      }
      const blob = await getCurrentPdfBlob();
      await uploadCompletedPdf(blob, applicationId, formAnswers, clientUsername);
      const previousUrl = livePdfUrl;
      const nextUrl = URL.createObjectURL(blob);
      setLivePdfUrl(nextUrl);
      setPdfVersion((v) => v + 1);
      if (previousUrl !== fileUrl) URL.revokeObjectURL(previousUrl);
      setIsPdfEditMode(false);
      setPdfEditSavedMessage('Changes saved.');
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save PDF edits');
      return false;
    } finally {
      setSavingPdfEdits(false);
    }
  }, [
    applicationId,
    canEditAttachments,
    clientUsername,
    currentViewerPageMeta.doc,
    fileUrl,
    formAnswers,
    getCurrentAttachmentPdfBlob,
    getCurrentPdfBlob,
    livePdfUrl,
    effectivePdfFormsReadOnly,
  ]);

  const handleCancelPdfEdits = useCallback(() => {
    // Reload the current committed PDF source and discard unsaved in-memory form edits.
    setPdfEditSavedMessage(null);
    setPdfVersion((v) => v + 1);
    setIsPdfEditMode(false);
  }, []);

  useEffect(() => () => { if (livePdfUrl !== fileUrl) URL.revokeObjectURL(livePdfUrl); }, [livePdfUrl, fileUrl]);

  useEffect(() => {
    pdfDocRef.current = null;
  }, [livePdfUrl]);

  useEffect(() => () => {
    pdfDocRef.current = null;
    attachmentPdfDocRef.current = null;
  }, []);

  useEffect(() => {
    if (startInEditMode) {
      setIsPdfEditMode(true);
    }
  }, [startInEditMode]);

  useImperativeHandle(ref, () => ({
    savePdfEdits: async () => handleSavePdfEdits(),
    discardPdfEdits: () => {
      handleCancelPdfEdits();
    },
  }), [handleSavePdfEdits, handleCancelPdfEdits]);

  const isPdfActionsLocked = showPdfEditControls && isPdfEditMode;
  let downloadButtonClass = 'tw-text-gray-700 tw-border tw-border-gray-300 hover:tw-bg-gray-50';
  if (isPdfActionsLocked) {
    downloadButtonClass = 'tw-text-gray-500 tw-bg-gray-200 tw-cursor-not-allowed';
  } else if (signedCount > 0) {
    downloadButtonClass = 'tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700';
  }
  const printButtonClass = isPdfActionsLocked
    ? 'tw-text-gray-500 tw-bg-gray-200 tw-cursor-not-allowed'
    : 'tw-text-gray-700 tw-border tw-border-gray-300 tw-bg-white hover:tw-bg-gray-50';

  let downloadStateLabel = 'filled';
  if (signedCount > 0) downloadStateLabel = 'signed';
  else if (signaturePlacements.length > 0) downloadStateLabel = 'unsigned';
  const downloadButtonLabel = preparingExport === 'download'
    ? 'Preparing PDF...'
    : `Download ${downloadStateLabel} PDF`;
  const printButtonLabel = preparingExport === 'print' ? 'Preparing PDF...' : 'Print';

  useEffect(() => {
    if (pageNum > totalViewerPages) {
      setPageNum(Math.max(1, totalViewerPages));
    }
  }, [pageNum, totalViewerPages]);

  return (
    <div className={`tw-flex tw-flex-col tw-gap-8 tw-items-start tw-w-full tw-mx-auto ${FRAME_MAX_WIDTH_CLASS}`}>
      <div
        className={`keepid-pdf-preview ${effectivePdfFormsReadOnly ? 'keepid-pdf-edit-locked' : ''} ${renderPdfFormWidgets ? 'keepid-pdf-form-widgets-active' : ''} tw-space-y-4 tw-w-full`}
      >
      {allSigned && signaturePlacements.length > 0 && (
        <div className="tw-flex tw-items-center tw-rounded-lg tw-border tw-border-green-200 tw-bg-green-50 tw-px-4 tw-py-2.5">
          <span className="tw-text-sm tw-font-medium tw-text-green-800">
            {signaturePlacements.length === 1
              ? 'Signature saved'
              : `All ${signaturePlacements.length} signatures saved`}
          </span>
        </div>
      )}

      {showPdfEditControls && (
        <div className="tw-flex tw-justify-end tw-items-center tw-gap-2">
          {!isPdfEditMode ? (
            <button
              type="button"
              onClick={() => {
                setSaveError(null);
                setPdfEditSavedMessage(null);
                setIsPdfEditMode(true);
              }}
              className="tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 tw-transition-colors"
            >
              Edit PDF
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSavePdfEdits}
                disabled={savingPdfEdits}
                className="tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 tw-transition-colors"
              >
                {savingPdfEdits ? 'Saving changes...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={handleCancelPdfEdits}
                className="tw-px-3 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-text-gray-700 tw-border tw-border-gray-300 tw-bg-white hover:tw-bg-gray-50 tw-transition-colors"
              >
                Cancel
              </button>
              <span className="tw-text-xs tw-text-gray-500">Editing enabled</span>
            </>
          )}
        </div>
      )}

      <Document
        file={currentViewerPageMeta.doc.url}
        key={`doc-${currentViewerPageMeta.doc.id}-${pdfVersion}`}
        onLoadSuccess={(pdf) => {
          if (currentViewerPageMeta.doc.kind === 'main') {
            setNumPages(pdf.numPages);
            pdfDocRef.current = pdf;
            attachmentPdfDocRef.current = null;
          } else {
            attachmentPdfDocRef.current = pdf;
          }
        }}
        loading={<div className="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">Loading PDF...</div>}
      >
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
          <div
            ref={handleFrameRef}
            className={`tw-w-full ${FRAME_MAX_WIDTH_CLASS} tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-200 tw-shadow-sm tw-overflow-hidden`}
          >
            <div className="tw-flex tw-items-center tw-justify-between tw-px-3 tw-pt-2 tw-pb-1 tw-text-sm tw-bg-gray-200">
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={totalViewerPages <= 1 || pageNum <= 1}
                className={`tw-bg-transparent tw-border-0 tw-p-0 tw-text-sm tw-font-normal tw-text-gray-600 hover:tw-text-gray-800 disabled:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-0 ${totalViewerPages <= 1 ? 'tw-invisible' : ''}`}
              >
                &larr; Prev
              </button>
              <span className="tw-text-sm tw-text-gray-700 tw-font-normal">Page {pageNum} / {totalViewerPages}</span>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.min(totalViewerPages, p + 1))}
                disabled={totalViewerPages <= 1 || pageNum >= totalViewerPages}
                className={`tw-bg-transparent tw-border-0 tw-p-0 tw-text-sm tw-font-normal tw-text-gray-600 hover:tw-text-gray-800 disabled:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-0 ${totalViewerPages <= 1 ? 'tw-invisible' : ''}`}
              >
                Next &rarr;
              </button>
            </div>
            {attachmentPreviewDocs.length > 0 && (
              <div className="tw-px-3 tw-pb-2 tw-text-xs tw-text-blue-700 tw-font-medium">
                Attached pages appended: {totalAttachedPages}
              </div>
            )}
            {!effectivePdfFormsReadOnly && !isViewingMainPdf && !canEditCurrentAttachment && (
              <div className="tw-px-3 tw-pb-2 tw-text-xs tw-text-amber-700 tw-font-medium">
                Attachment pages are view-only. Edit fields on the main application pages.
              </div>
            )}
            <div ref={pdfWrapperRef} className="tw-relative tw-bg-gray-200 tw-px-1 tw-pb-1">
              <div className="tw-bg-gray-100 tw-rounded tw-w-full tw-overflow-hidden">
                <Page
                  key={`preview-${pageNum}-${currentViewerPageMeta.doc.id}-v${pdfVersion}`}
                  pageNumber={currentViewerPageMeta.localPage}
                  onLoadSuccess={isViewingMainPdf ? onPageLoadForOverlays : undefined}
                  width={renderedWidth > 0 ? renderedWidth : undefined}
                  devicePixelRatio={pageDevicePixelRatio}
                  renderAnnotationLayer
                  renderTextLayer
                  renderForms={renderPdfFormWidgets && (isViewingMainPdf || canEditCurrentAttachment)}
                />
              </div>
              {effectivePdfFormsReadOnly && (
                <div
                  className="tw-absolute tw-inset-0 tw-z-10 tw-cursor-not-allowed"
                  title="PDF is read-only."
                />
              )}
              {isViewingMainPdf && sigOverlays.map((rect) => {
                const isEmbedded = embeddedBoxes.has(rect.placementIdx);
                if (isEmbedded) return null;
                const isActive = activePlacementIdx === rect.placementIdx;
                return (
                  <div
                    key={`sig-preview-${rect.placementIdx}`}
                    style={{ position: 'absolute', left: rect.left, top: rect.top, width: rect.width, height: rect.height, zIndex: 20 }}
                    className={`tw-border tw-border-dashed tw-rounded tw-flex tw-items-center tw-justify-center tw-cursor-pointer tw-transition-colors tw-outline-none focus:tw-outline-none focus:tw-ring-0 ${
                      isActive
                        ? 'tw-border-blue-400 tw-bg-blue-50/60'
                        : 'tw-border-blue-300 tw-bg-blue-50/40 hover:tw-bg-blue-50/60'
                    }`}
                    onClick={() => selectBox(rect.placementIdx)}
                  >
                    <span className={`tw-text-xs tw-font-medium tw-select-none tw-pointer-events-none ${isActive ? 'tw-text-blue-700' : 'tw-text-blue-600'}`}>
                      {isActive ? 'Draw below ↓' : 'Click to sign'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Document>

      {pdfEditSavedMessage && (
        <div className="tw-p-3 tw-rounded-lg tw-bg-green-50 tw-border tw-border-green-200 tw-text-green-700 tw-text-sm">
          {pdfEditSavedMessage}
        </div>
      )}
      {activePlacementIdx !== null && !embeddedBoxes.has(activePlacementIdx) && (
        <div ref={sigPadAreaRef} className="tw-rounded-lg tw-border tw-border-blue-200 tw-bg-blue-50 tw-px-4 tw-py-3 tw-space-y-2">
          <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
            <span className="tw-text-xs tw-font-semibold tw-text-gray-800">
              Signing box {activePlacementIdx + 1} of {signaturePlacements.length}
            </span>
            <div className="tw-flex tw-shrink-0 tw-items-center tw-gap-2">
              {signedCount > 0 && <span className="tw-text-[10px] tw-text-gray-500">{signedCount}/{signaturePlacements.length} done</span>}
              <button
                type="button"
                onClick={openSigExpandModal}
                className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-p-1 tw-text-gray-600 hover:tw-bg-blue-100 hover:tw-text-gray-900 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-1"
                aria-label="Expand signature pad"
                title="Expand signature pad"
              >
                <ArrowsPointingOutIcon className="tw-h-5 tw-w-5" aria-hidden />
              </button>
            </div>
          </div>
          {!sigExpandModalOpen ? (
            <SignaturePadCanvas
              key={`inline-${activePlacementIdx}`}
              canvasWidth={padCanvasW}
              canvasHeight={padCanvasH}
              cssHeight={PAD_CSS_HEIGHT}
              initialDataUrl={inlineSigRestoreUrl}
              onSignatureChange={handleSignatureChange}
            />
          ) : (
            <p className="tw-text-xs tw-text-gray-600 tw-py-2">
              Use the expanded window to sign. Close it when you are done, then embed your signature below.
            </p>
          )}
          <button
            type="button"
            disabled={!currentSigDataUrl || applying}
            onClick={handleEmbedSignature}
            className={`tw-w-full tw-py-2 tw-rounded-lg tw-text-xs tw-font-medium tw-transition-colors disabled:tw-cursor-not-allowed tw-border-0 ${
              currentSigDataUrl && !applying
                ? 'tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700'
                : 'tw-text-gray-600 tw-bg-gray-300'
            }`}
          >
            {applying ? 'Saving signature...' : 'Apply and save signature'}
          </button>
        </div>
      )}

      {sigExpandModalOpen && activePlacementIdx !== null && !embeddedBoxes.has(activePlacementIdx) && (
        <div
          className="tw-fixed tw-inset-0 tw-z-[1040] tw-flex tw-items-center tw-justify-center tw-p-3 sm:tw-p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="keepid-sig-expand-title"
        >
          <button
            type="button"
            className="tw-absolute tw-inset-0 tw-border-0 tw-bg-black/50 tw-p-0 tw-cursor-pointer"
            aria-label="Close expanded signature"
            onClick={closeSigExpandModal}
          />
          <div className="tw-relative tw-z-10 tw-flex tw-max-h-[min(92vh,900px)] tw-w-full tw-max-w-[min(98vw,1300px)] tw-flex-col tw-overflow-hidden tw-rounded-xl tw-border tw-border-gray-200 tw-bg-white tw-shadow-2xl">
            <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-gray-200 tw-px-4 tw-py-3">
              <h2 id="keepid-sig-expand-title" className="tw-m-0 tw-text-sm tw-font-semibold tw-text-gray-900">
                Sign here
              </h2>
              <button
                type="button"
                onClick={closeSigExpandModal}
                className="tw-inline-flex tw-items-center tw-justify-center tw-rounded-md tw-p-1.5 tw-text-gray-500 hover:tw-bg-gray-100 hover:tw-text-gray-800 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
                aria-label="Close"
              >
                <XMarkIcon className="tw-h-5 tw-w-5" aria-hidden />
              </button>
            </div>
            <div className="tw-min-h-0 tw-flex-1 tw-overflow-y-auto tw-bg-slate-100/90 tw-p-4 sm:tw-p-6">
              <p className="tw-mb-3 tw-text-xs tw-text-blue-900/80">
                Sign inside the white rectangle below. This outline matches where your signature will appear on the PDF.
              </p>
              <div className="tw-rounded-lg tw-border-2 tw-border-dashed tw-border-blue-500 tw-bg-white tw-p-2 tw-ring-2 tw-ring-blue-200/60">
                <SignaturePadCanvas
                  key={`modal-${activePlacementIdx}`}
                  canvasWidth={modalPadCanvasW}
                  canvasHeight={modalPadCanvasH}
                  cssHeight={modalPadCssHeight}
                  initialDataUrl={modalSigSnapshot}
                  onSignatureChange={handleSignatureChange}
                  canvasClassName="tw-w-full tw-bg-white tw-rounded-md tw-border-2 tw-border-blue-200 tw-cursor-crosshair tw-touch-none"
                />
              </div>
            </div>
            <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-end tw-gap-2 tw-border-t tw-border-gray-200 tw-px-4 tw-py-3 tw-bg-gray-50">
              <button
                type="button"
                onClick={closeSigExpandModal}
                className="tw-rounded-lg tw-border tw-border-gray-300 tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50"
              >
                Done
              </button>
              <button
                type="button"
                disabled={!currentSigDataUrl || applying}
                onClick={async () => {
                  const ok = await handleEmbedSignature();
                  if (ok) closeSigExpandModal(false);
                }}
                className={`tw-rounded-lg tw-border-0 tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-transition-colors disabled:tw-cursor-not-allowed ${
                  currentSigDataUrl && !applying
                    ? 'tw-bg-blue-600 tw-text-white hover:tw-bg-blue-700'
                    : 'tw-bg-gray-300 tw-text-gray-600'
                }`}
              >
                {applying ? 'Saving signature...' : 'Apply and save signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {attachmentOptions.length > 0 && (
        <div className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-px-4 tw-py-3">
          <h4 className="tw-text-sm tw-font-bold tw-text-gray-900 tw-mb-2">Add to application packet</h4>
          {!allSigned ? (
            <div className="tw-p-3 tw-rounded-lg tw-bg-yellow-50 tw-text-yellow-800 tw-text-sm tw-mb-2">
              Please complete all signatures above before appending additional documents to the application.
            </div>
          ) : (
            <>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-3">
                Choose generated organization documents or photo identification to include with this application.
              </p>
              <div className="tw-flex tw-flex-col tw-gap-2">
                {attachmentOptions.map((option) => (
                  <label key={option.key} className="tw-flex tw-items-start tw-gap-2 tw-rounded-md tw-border tw-border-gray-200 tw-bg-white tw-p-3 tw-text-sm tw-text-gray-800">
                    <input
                      type="checkbox"
                      checked={stagedDocs.has(option.key)}
                      disabled={isAppendingDocs || (!option.available && !option.selected)}
                      onChange={() => toggleStagedDoc(option.key)}
                      className="tw-form-checkbox tw-mt-0.5 tw-h-4 tw-w-4 tw-text-blue-600 tw-rounded tw-border-gray-300 disabled:tw-opacity-50"
                    />
                    <span className="tw-min-w-0">
                      <span className="tw-block tw-font-medium tw-text-gray-900">{option.label}</span>
                      {option.description && (
                        <span className="tw-mt-0.5 tw-block tw-text-xs tw-text-gray-600">{option.description}</span>
                      )}
                      {!option.available && option.unavailableReason && (
                        <span className="tw-mt-1 tw-block tw-text-xs tw-text-amber-700">{option.unavailableReason}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={applyOrgDocs}
                disabled={isAppendingDocs || !hasAttachmentSelectionChanges}
                className="tw-mt-3 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed tw-transition-colors"
              >
                {isAppendingDocs ? 'Applying changes...' : 'Apply Changes'}
              </button>
              {isAppendingDocs && (
                <div className="tw-text-xs tw-text-blue-600 tw-mt-2 tw-font-medium">
                  Updating PDF preview...
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="tw-flex tw-gap-2 tw-flex-col sm:tw-flex-row tw-flex-wrap">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isPdfActionsLocked || preparingExport !== null}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${downloadButtonClass}`}
        >
          {downloadButtonLabel}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={isPdfActionsLocked || preparingExport !== null}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${printButtonClass}`}
        >
          {printButtonLabel}
        </button>
        <button
          type="button"
          onClick={() => setMailDialogIsOpen(true)}
          disabled={isPdfActionsLocked || !allSigned}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${printButtonClass}`}
        >
          Mail
        </button>
        {showSaveButton && (
          <button
            type="button"
            disabled={saving || !allSigned}
            onClick={handleSave}
            className="tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-colors"
          >
            {saving ? 'Finishing...' : 'Finish application'}
          </button>
        )}
      </div>

      {saveError && (
        <div className="tw-p-3 tw-rounded-lg tw-bg-red-50 tw-border tw-border-red-200 tw-text-red-700 tw-text-sm">
          {saveError}
        </div>
      )}
      </div>
      <MailModal
        alert={alert}
        isVisible={mailDialogIsOpen}
        setIsVisible={setMailDialogIsOpen}
        showMailSuccess={showMailSuccess}
        setShowMailSuccess={setShowMailSuccess}
        userRole=""
        targetUser={clientUsername || ''}
        documentId={applicationId}
        documentUploader=""
        documentDate=""
        documentName={title ?? ''}
      />
      <MailConfirmation isVisible={showMailSuccess} setIsVisible={setShowMailSuccess} />
    </div>
  );
});

export default SignAndDownloadViewer;

function SignaturePadCanvas({
  canvasWidth,
  canvasHeight,
  cssHeight,
  initialDataUrl = null,
  onSignatureChange,
  canvasClassName = 'tw-w-full tw-bg-white tw-rounded tw-border tw-border-gray-200 tw-cursor-crosshair tw-touch-none',
}: {
  canvasWidth: number;
  canvasHeight: number;
  cssHeight: number;
  initialDataUrl?: string | null;
  onSignatureChange: (dataUrl: string | null) => void;
  /** Tailwind classes for the canvas element (default matches inline pad). */
  canvasClassName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  /** Scale stroke with bitmap size so large modal canvases do not produce hairline strokes when embedded. */
  const strokeLineWidth = Math.max(7, Math.round(Math.min(canvasWidth, canvasHeight) * 0.022));

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    if (!initialDataUrl) {
      ctx.clearRect(0, 0, c.width, c.height);
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
    };
    img.onerror = () => {
      ctx.clearRect(0, 0, c.width, c.height);
    };
    img.src = initialDataUrl;
  }, [initialDataUrl, canvasWidth, canvasHeight]);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const c = canvasRef.current;
    if (!c) return null;
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - r.left) * scaleX, y: (t.clientY - r.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - r.left) * scaleX, y: ((e as React.MouseEvent).clientY - r.top) * scaleY };
  };

  const startStroke = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const continueStroke = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    const pos = getPos(e);
    if (!ctx || !pos) return;
    ctx.lineWidth = strokeLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const c = canvasRef.current;
    if (c) onSignatureChange(c.toDataURL('image/png'));
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    onSignatureChange(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={canvasClassName}
        style={{ height: cssHeight }}
        onMouseDown={startStroke}
        onMouseMove={continueStroke}
        onMouseUp={endStroke}
        onMouseLeave={endStroke}
        onTouchStart={startStroke}
        onTouchMove={continueStroke}
        onTouchEnd={endStroke}
      />
      <button type="button" onClick={clear} className="tw-mt-1 tw-text-xs tw-text-gray-700 hover:tw-text-gray-900 tw-bg-transparent tw-border-0 tw-p-0 tw-cursor-pointer">
        Clear
      </button>
    </div>
  );
}
