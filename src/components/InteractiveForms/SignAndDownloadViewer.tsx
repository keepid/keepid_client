import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './sign-and-download-viewer.css';

import { PDFDocument } from 'pdf-lib';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';

import getServerURL from '../../serverOverride';
import { uploadCompletedPdf } from '../Applications/api/interactiveForm';
import { MailConfirmation, MailModal } from '../Documents/MailModal';
import type { SignaturePlacement } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface SignAndDownloadViewerProps {
  fileUrl: string;
  signaturePlacements: SignaturePlacement[];
  title?: string;
  applicationId: string;
  formAnswers: Record<string, unknown>;
  clientUsername?: string;
  onSaveSuccess?: () => void;
  postRequirements?: string;
  showSaveButton?: boolean;
  showPdfEditControls?: boolean;
  pdfFormsReadOnly?: boolean;
  startInEditMode?: boolean;
}

export interface SignAndDownloadViewerHandle {
  savePdfEdits: () => Promise<boolean>;
  discardPdfEdits: () => void;
}

const SignAndDownloadViewer = React.forwardRef<SignAndDownloadViewerHandle, SignAndDownloadViewerProps>(({
  fileUrl,
  signaturePlacements,
  title,
  applicationId,
  formAnswers,
  clientUsername = '',
  onSaveSuccess,
  postRequirements,
  showSaveButton = true,
  showPdfEditControls = false,
  pdfFormsReadOnly = false,
  startInEditMode = false,
}, ref) => {
  const FRAME_MAX_WIDTH_CLASS = 'tw-max-w-4xl';
  const [numPages, setNumPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const pdfWrapperRef = useRef<HTMLDivElement>(null);
  const sigPadAreaRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(560);
  const [currentSigDataUrl, setCurrentSigDataUrl] = useState<string | null>(null);
  const alert = useAlert();
  const [mailDialogIsOpen, setMailDialogIsOpen] = useState(false);
  const [showMailSuccess, setShowMailSuccess] = useState(false);
  const [activePlacementIdx, setActivePlacementIdx] = useState<number | null>(null);
  const [livePdfUrl, setLivePdfUrl] = useState<string>(fileUrl);
  const [embeddedBoxes, setEmbeddedBoxes] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Org Documents State
  const [orgDocs, setOrgDocs] = useState<{ id: string; filename: string }[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [stagedDocs, setStagedDocs] = useState<Set<string>>(new Set());
  const [isAppendingDocs, setIsAppendingDocs] = useState(false);
  const [basePdfBlob, setBasePdfBlob] = useState<Blob | null>(null);
  const [savingPdfEdits, setSavingPdfEdits] = useState(false);
  const [pdfEditSavedMessage, setPdfEditSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPdfEditMode, setIsPdfEditMode] = useState(startInEditMode);
  const [sigOverlays, setSigOverlays] = useState<{ left: number; top: number; width: number; height: number; placementIdx: number }[]>([]);
  const [pdfVersion, setPdfVersion] = useState(0);
  const pdfDocRef = useRef<{ saveDocument:() => Promise<Uint8Array> } | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const updateWidth = () => setFrameWidth(el.clientWidth);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const renderedWidth = Math.max(100, frameWidth - 2);
  /** pdf.js HTML widgets whenever the document is editable; flushes via saveDocument on save/download/sign. */
  const usePdfJsFormWidgets = !pdfFormsReadOnly;

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

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch(`${getServerURL()}/get-files`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ fileType: 'ORG_DOCUMENT' }),
        });
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.documents) {
          setOrgDocs(data.documents);
        }
      } catch (err) {
        console.error('Failed to load org docs', err);
      }
    }
    fetchDocs();
  }, []);

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
    setPageNum(signaturePlacements[idx].page + 1);
    requestAnimationFrame(() => sigPadAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }, [embeddedBoxes, signaturePlacements]);

  const handleEmbedSignature = useCallback(async () => {
    if (activePlacementIdx === null || !currentSigDataUrl) return;
    setApplying(true);
    try {
      let pdfBytes: ArrayBuffer | Uint8Array;
      if (usePdfJsFormWidgets && pdfDocRef.current?.saveDocument) {
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
      let drawW = w; let drawH = h;
      if (imgAspect > boxAspect) { drawH = w / imgAspect; } else { drawW = h * imgAspect; }
      page.drawImage(sigImage, { x: x + (w - drawW) / 2, y: y + (h - drawH) / 2, width: drawW, height: drawH });
      const bytes = await pdfDoc.save();
      const blob = toPdfBlob(bytes);
      const oldUrl = livePdfUrl;
      const newUrl = URL.createObjectURL(blob);
      setLivePdfUrl(newUrl);
      setPdfVersion((v) => v + 1);
      if (oldUrl !== fileUrl) URL.revokeObjectURL(oldUrl);
      setEmbeddedBoxes((prev) => new Set(prev).add(activePlacementIdx));
      setCurrentSigDataUrl(null);
      const nextUnsigned = signaturePlacements.findIndex((_, i) => i !== activePlacementIdx && !embeddedBoxes.has(i));
      if (nextUnsigned >= 0) {
        setActivePlacementIdx(nextUnsigned);
        setPageNum(signaturePlacements[nextUnsigned].page + 1);
      } else {
        setActivePlacementIdx(null);
      }
    } catch (err) {
      console.error('Failed to embed signature', err);
    } finally {
      setApplying(false);
    }
  }, [activePlacementIdx, currentSigDataUrl, livePdfUrl, fileUrl, signaturePlacements, embeddedBoxes, usePdfJsFormWidgets]);

  const toggleStagedDoc = useCallback((docId: string) => {
    setStagedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  }, []);

  const applyOrgDocs = useCallback(async () => {
    setIsAppendingDocs(true);
    try {
      const nextSelected = new Set(stagedDocs);

      let baseBlob = basePdfBlob;
      // If we are currently at 0 docs, capture the CURRENT state as the new base.
      if (selectedDocs.size === 0) {
        let bytes: ArrayBuffer | Uint8Array;
        if (usePdfJsFormWidgets && pdfDocRef.current?.saveDocument) {
          bytes = await pdfDocRef.current.saveDocument();
        } else {
          bytes = await fetch(livePdfUrl).then((r) => r.arrayBuffer());
        }
        baseBlob = toPdfBlob(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
        setBasePdfBlob(baseBlob);
      }

      // If the new selection is 0, just revert to the base blob
      if (nextSelected.size === 0 && baseBlob) {
        const newUrl = URL.createObjectURL(baseBlob);
        setLivePdfUrl(newUrl);
        setPdfVersion((v) => v + 1);
        setSelectedDocs(nextSelected);
        setIsAppendingDocs(false);
        return;
      }

      if (!baseBlob) {
         setIsAppendingDocs(false);
         return;
      }

      // Otherwise, rebuild exactly from baseBlob + nextSelected
      const baseBytes = await baseBlob.arrayBuffer();
      const baseDoc = await PDFDocument.load(baseBytes, { ignoreEncryption: true });

      // Fetch each selected doc and append
      for (let i = 0; i < orgDocs.length; i += 1) {
        const id = orgDocs[i].id;
        if (nextSelected.has(id)) {
          /* eslint-disable-next-line no-await-in-loop */
          const res = await fetch(`${getServerURL()}/download-file`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId: id, fileType: 'ORG_DOCUMENT' }),
          });
          if (res.ok) {
            /* eslint-disable-next-line no-await-in-loop */
            const docBytes = await res.arrayBuffer();
            /* eslint-disable-next-line no-await-in-loop */
            const appendDoc = await PDFDocument.load(docBytes, { ignoreEncryption: true });
            /* eslint-disable-next-line no-await-in-loop */
            const copiedPages = await baseDoc.copyPages(appendDoc, appendDoc.getPageIndices());
            copiedPages.forEach((page) => baseDoc.addPage(page));
          }
        }
      }

      const newBytes = await baseDoc.save();
      const newBlob = toPdfBlob(newBytes);
      const newUrl = URL.createObjectURL(newBlob);
      const oldUrl = livePdfUrl;
      setLivePdfUrl(newUrl);
      setPdfVersion((v) => v + 1);
      if (oldUrl !== fileUrl && oldUrl !== (baseBlob as any)?.url) URL.revokeObjectURL(oldUrl);
      setSelectedDocs(nextSelected);
    } catch (err) {
      console.error('Failed to append doc', err);
    } finally {
      setIsAppendingDocs(false);
    }
  }, [basePdfBlob, stagedDocs, selectedDocs, livePdfUrl, fileUrl, orgDocs, usePdfJsFormWidgets]);

  const getCurrentPdfBlob = useCallback(async (): Promise<Blob> => {
    if (usePdfJsFormWidgets && pdfDocRef.current?.saveDocument) {
      const bytes = await pdfDocRef.current.saveDocument();
      return toPdfBlob(bytes);
    }
    const res = await fetch(livePdfUrl);
    return res.blob();
  }, [livePdfUrl, usePdfJsFormWidgets]);

  const handlePrint = useCallback(async () => {
    try {
      const blob = await getCurrentPdfBlob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 1000);
        }
      };
    } catch (err) {
      console.error('Print failed', err);
      const printWindow = window.open(livePdfUrl, '_blank');
      if (printWindow) printWindow.onload = () => printWindow.print();
    }
  }, [livePdfUrl, getCurrentPdfBlob]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await getCurrentPdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'signed'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      const a = document.createElement('a');
      a.href = livePdfUrl;
      a.download = `${title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'signed'}.pdf`;
      a.click();
    }
  }, [livePdfUrl, title, getCurrentPdfBlob]);

  const handleSave = useCallback(async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const blob = await getCurrentPdfBlob();
      await uploadCompletedPdf(blob, applicationId, formAnswers, clientUsername);
      onSaveSuccess?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save application');
    } finally {
      setSaving(false);
    }
  }, [getCurrentPdfBlob, applicationId, formAnswers, clientUsername, onSaveSuccess]);

  const handleSavePdfEdits = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    setPdfEditSavedMessage(null);
    setSavingPdfEdits(true);
    try {
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
  }, [applicationId, clientUsername, fileUrl, formAnswers, getCurrentPdfBlob, livePdfUrl]);

  const handleCancelPdfEdits = useCallback(() => {
    // Reload the current committed PDF source and discard unsaved in-memory form edits.
    setPdfEditSavedMessage(null);
    setPdfVersion((v) => v + 1);
    setIsPdfEditMode(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentSigDataUrl(null);
    if (livePdfUrl !== fileUrl) URL.revokeObjectURL(livePdfUrl);
    setLivePdfUrl(fileUrl);
    setPdfVersion((v) => v + 1);
    setEmbeddedBoxes(new Set());
    setSelectedDocs(new Set());
    setStagedDocs(new Set());
    setBasePdfBlob(null);
    const first = signaturePlacements.length > 0 ? 0 : null;
    setActivePlacementIdx(first);
    if (first !== null) setPageNum(signaturePlacements[first].page + 1);
  }, [livePdfUrl, fileUrl, signaturePlacements]);

  useEffect(() => () => { if (livePdfUrl !== fileUrl) URL.revokeObjectURL(livePdfUrl); }, [livePdfUrl, fileUrl]);

  useEffect(() => () => { pdfDocRef.current = null; }, []);

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
  const hasMultiplePages = numPages > 1;
  let downloadButtonClass = 'tw-text-gray-700 tw-border tw-border-gray-300 hover:tw-bg-gray-50';
  if (isPdfActionsLocked) {
    downloadButtonClass = 'tw-text-gray-500 tw-bg-gray-200 tw-cursor-not-allowed';
  } else if (signedCount > 0) {
    downloadButtonClass = 'tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700';
  }
  const printButtonClass = isPdfActionsLocked
    ? 'tw-text-gray-500 tw-bg-gray-200 tw-cursor-not-allowed'
    : 'tw-text-gray-700 tw-border tw-border-gray-300 tw-bg-white hover:tw-bg-gray-50';

  return (
    <div className={`tw-flex tw-flex-col tw-gap-8 tw-items-start tw-w-full tw-mx-auto ${FRAME_MAX_WIDTH_CLASS}`}>
      <div
        className={`keepid-pdf-preview ${pdfFormsReadOnly ? 'keepid-pdf-edit-locked' : ''} ${usePdfJsFormWidgets ? 'keepid-pdf-form-widgets-active' : ''} tw-space-y-4 tw-w-full`}
      >
      {allSigned && signaturePlacements.length > 0 && (
        <div className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-green-200 tw-bg-green-50 tw-px-4 tw-py-2.5">
          <span className="tw-text-sm tw-font-medium tw-text-green-800">
            All {signaturePlacements.length} signature{signaturePlacements.length > 1 ? 's' : ''} embedded
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="tw-text-xs tw-text-green-700 hover:tw-text-green-900 tw-underline tw-bg-transparent tw-border-0 tw-p-0 focus:tw-outline-none focus:tw-ring-0"
          >
            Reset &amp; re-sign
          </button>
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
        file={livePdfUrl}
        key={`doc-${pdfVersion}`}
        onLoadSuccess={(pdf) => {
          setNumPages(pdf.numPages);
          pdfDocRef.current = pdf;
        }}
        loading={<div className="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-gray-400">Loading PDF...</div>}
      >
        <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
          <div
            ref={frameRef}
            className={`tw-w-full ${FRAME_MAX_WIDTH_CLASS} tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-200 tw-shadow-sm tw-overflow-hidden`}
          >
            <div className="tw-flex tw-items-center tw-justify-between tw-px-3 tw-pt-2 tw-pb-1 tw-text-sm tw-bg-gray-200">
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                disabled={!hasMultiplePages || pageNum <= 1}
                className={`tw-bg-transparent tw-border-0 tw-p-0 tw-text-sm tw-font-normal tw-text-gray-600 hover:tw-text-gray-800 disabled:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-0 ${!hasMultiplePages ? 'tw-invisible' : ''}`}
              >
                &larr; Prev
              </button>
              <span className="tw-text-sm tw-text-gray-700 tw-font-normal">Page {pageNum} / {numPages}</span>
              <button
                type="button"
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                disabled={!hasMultiplePages || pageNum >= numPages}
                className={`tw-bg-transparent tw-border-0 tw-p-0 tw-text-sm tw-font-normal tw-text-gray-600 hover:tw-text-gray-800 disabled:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-0 ${!hasMultiplePages ? 'tw-invisible' : ''}`}
              >
                Next &rarr;
              </button>
            </div>
            <div ref={pdfWrapperRef} className="tw-relative tw-bg-gray-200 tw-px-1 tw-pb-1">
              <div className="tw-bg-gray-100 tw-rounded tw-w-full tw-overflow-hidden">
                <Page
                  key={`preview-${pageNum}-v${pdfVersion}`}
                  pageNumber={pageNum}
                  onLoadSuccess={onPageLoadForOverlays}
                  width={renderedWidth > 0 ? renderedWidth : undefined}
                  renderAnnotationLayer
                  renderTextLayer
                  renderForms={usePdfJsFormWidgets}
                />
              </div>
              {pdfFormsReadOnly && (
                <div
                  className="tw-absolute tw-inset-0 tw-z-30 tw-cursor-not-allowed"
                  title="PDF is read-only."
                />
              )}
              {sigOverlays.map((rect) => {
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
      {selectedDocs.size === 0 && activePlacementIdx !== null && !embeddedBoxes.has(activePlacementIdx) && (
        <div ref={sigPadAreaRef} className="tw-rounded-lg tw-border tw-border-blue-200 tw-bg-blue-50 tw-px-4 tw-py-3 tw-space-y-2">
          <div className="tw-flex tw-items-center tw-justify-between">
            <span className="tw-text-xs tw-font-semibold tw-text-gray-800">
              Signing box {activePlacementIdx + 1} of {signaturePlacements.length}
            </span>
            {signedCount > 0 && <span className="tw-text-[10px] tw-text-gray-500">{signedCount}/{signaturePlacements.length} done</span>}
          </div>
          <SignaturePadCanvas
            key={activePlacementIdx}
            canvasWidth={padCanvasW}
            canvasHeight={padCanvasH}
            cssHeight={PAD_CSS_HEIGHT}
            onSignatureChange={setCurrentSigDataUrl}
          />
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
            {applying ? 'Embedding...' : 'Embed signature'}
          </button>
        </div>
      )}

      {postRequirements && (
        <div className="tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-p-6 tw-shadow-sm tw-mt-2">
          <h3 className="tw-text-xl tw-font-bold tw-text-gray-900 tw-mb-4 tw-pb-4 tw-border-b tw-border-gray-100">Post Application Instructions</h3>
          <div className="tw-prose tw-prose-sm tw-max-w-none tw-text-gray-700 tw-prose-headings:tw-text-gray-900 tw-prose-a:tw-text-blue-600">
            <ReactMarkdown>{postRequirements}</ReactMarkdown>
          </div>
        </div>
      )}

      {orgDocs.length > 0 && (
        <div className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-px-4 tw-py-3">
          <h4 className="tw-text-sm tw-font-bold tw-text-gray-900 tw-mb-2">Append Organization Documents</h4>
          {!allSigned ? (
            <div className="tw-p-3 tw-rounded-lg tw-bg-yellow-50 tw-text-yellow-800 tw-text-sm tw-mb-2">
              Please complete all signatures above before appending additional documents to the application.
            </div>
          ) : (
            <>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-3">
                Check the documents you want to append to the end of this application PDF.
                <i> (Note: Any unsaved form modifications may be reset when toggling documents.)</i>
              </p>
              <div className="tw-flex tw-flex-col tw-gap-2">
                {orgDocs.map((doc) => (
                  <label key={doc.id} className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-800 tw-cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stagedDocs.has(doc.id)}
                      disabled={isAppendingDocs}
                      onChange={() => toggleStagedDoc(doc.id)}
                      className="tw-form-checkbox tw-h-4 tw-w-4 tw-text-blue-600 tw-rounded tw-border-gray-300 disabled:tw-opacity-50"
                    />
                    {doc.filename}
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={applyOrgDocs}
                disabled={isAppendingDocs}
                className="tw-mt-3 tw-px-4 tw-py-2 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed tw-transition-colors"
              >
                {isAppendingDocs ? 'Re-rendering PDF...' : 'Attach Checked Documents'}
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
          disabled={isPdfActionsLocked}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${downloadButtonClass}`}
        >
          Download {(() => {
          if (signedCount > 0) return 'signed';
          if (signaturePlacements.length > 0) return 'unsigned';
          return 'filled';
        })()} PDF
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={isPdfActionsLocked}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${printButtonClass}`}
        >
          Print
        </button>
        <button
          type="button"
          onClick={() => setMailDialogIsOpen(true)}
          disabled={isPdfActionsLocked}
          className={`tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-transition-colors ${printButtonClass}`}
        >
          Mail
        </button>
        {showSaveButton && (
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="tw-flex-1 tw-min-w-0 tw-py-2.5 tw-rounded-lg tw-text-sm tw-font-medium tw-text-white tw-bg-green-600 hover:tw-bg-green-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-transition-colors"
          >
            {saving ? 'Saving...' : 'Save Application'}
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
  onSignatureChange,
}: {
  canvasWidth: number;
  canvasHeight: number;
  cssHeight: number;
  onSignatureChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

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
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';
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
        className="tw-w-full tw-bg-white tw-rounded tw-border tw-border-gray-200 tw-cursor-crosshair tw-touch-none"
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
