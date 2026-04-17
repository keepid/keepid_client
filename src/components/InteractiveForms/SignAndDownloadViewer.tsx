import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './sign-and-download-viewer.css';

import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PDFDocument } from 'pdf-lib';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useAlert } from 'react-alert';
import ReactMarkdown from 'react-markdown';
import { Document, Page, pdfjs } from 'react-pdf';

import getServerURL from '../../serverOverride';
import {
  fillAttachmentPdfBlob,
  getQuestionsV2,
  updateApplicationAttachmentPdf,
  uploadCompletedPdf,
} from '../Applications/api/interactiveForm';
import { MailConfirmation, MailModal } from '../Documents/MailModal';
import { buildOrgAttachmentAutofillAnswers } from './attachmentAutofill';
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
  canEditAttachments?: boolean;
}

export interface SignAndDownloadViewerHandle {
  savePdfEdits: () => Promise<boolean>;
  discardPdfEdits: () => void;
}

type PacketPartResponse = {
  fileId: string;
  partType: string;
  sourceFileId?: string;
  order?: number;
  enabled?: boolean;
};

type CurrentPdfBlobOptions = {
  flattenInteractiveFields?: boolean;
};

type AttachmentPreviewDoc = { id: string; sourceFileId: string; url: string; filename: string; pageCount: number };

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
  const [embeddedBoxes, setEmbeddedBoxes] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  // Org Documents State
  const [orgDocs, setOrgDocs] = useState<{ id: string; filename: string }[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [stagedDocs, setStagedDocs] = useState<Set<string>>(new Set());
  const [isAppendingDocs, setIsAppendingDocs] = useState(false);
  const [packetStateLoaded, setPacketStateLoaded] = useState(false);
  const [packetSelectionHydrated, setPacketSelectionHydrated] = useState(false);
  const [packetPersistenceAvailable, setPacketPersistenceAvailable] = useState(true);
  const [attachmentPreviewDocs, setAttachmentPreviewDocs] = useState<AttachmentPreviewDoc[]>([]);
  const [attachedCloneBySourceId, setAttachedCloneBySourceId] = useState<Map<string, string>>(new Map());
  const [savingPdfEdits, setSavingPdfEdits] = useState(false);
  const [pdfEditSavedMessage, setPdfEditSavedMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attachmentAutofillWarning, setAttachmentAutofillWarning] = useState<string | null>(null);
  const [isPdfEditMode, setIsPdfEditMode] = useState(startInEditMode);
  const [sigOverlays, setSigOverlays] = useState<{ left: number; top: number; width: number; height: number; placementIdx: number }[]>([]);
  const [pdfVersion, setPdfVersion] = useState(0);
  const pdfDocRef = useRef<{ saveDocument:() => Promise<Uint8Array> } | null>(null);
  const attachmentPdfDocRef = useRef<{ saveDocument:() => Promise<Uint8Array> } | null>(null);
  const hydrationComposeInFlightRef = useRef(false);

  const handleSignatureChange = useCallback((url: string | null) => {
    setCurrentSigDataUrl(url);
    if (url === null) setInlineSigRestoreUrl(null);
  }, []);

  const openSigExpandModal = useCallback(() => {
    setModalSigSnapshot(currentSigRef.current);
    setSigExpandModalOpen(true);
  }, []);

  const closeSigExpandModal = useCallback((restoreCurrentSignature = true) => {
    setSigExpandModalOpen(false);
    setInlineSigRestoreUrl(restoreCurrentSignature ? currentSigRef.current : null);
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const updateWidth = () => setFrameWidth(el.clientWidth);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  const readPacketSelection = useCallback((data: any) => {
    if (data?.status === 'NO_SUCH_FILE') {
      // Freshly created applications can have no packet yet; treat as empty selection, not a hard failure.
      setPacketPersistenceAvailable(true);
      setAttachedCloneBySourceId(new Map());
      setSelectedDocs(new Set());
      setStagedDocs(new Set());
      return;
    }
    if (data?.status !== 'SUCCESS') {
      setPacketPersistenceAvailable(false);
      return;
    }
    setPacketPersistenceAvailable(true);
    const parts: PacketPartResponse[] = Array.isArray(data.packet?.parts) ? data.packet.parts : [];
    const attachmentParts = parts
      .filter((part) => part.partType === 'ORG_ATTACHMENT' && part.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const sourceToCloneEntries = attachmentParts.map((part) => [part.sourceFileId || part.fileId, part.fileId] as const);
    const selectedSourceIds = sourceToCloneEntries.map(([sourceId]) => sourceId);
    setAttachedCloneBySourceId(new Map(sourceToCloneEntries));
    setSelectedDocs(new Set(selectedSourceIds));
    setStagedDocs(new Set(selectedSourceIds));
  }, []);

  const fetchPacketSelection = useCallback(async () => {
    const res = await fetch(`${getServerURL()}/get-packet-for-application`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId }),
    });
    const data = await res.json();
    readPacketSelection(data);
    return data;
  }, [applicationId, readPacketSelection]);

  useEffect(() => {
    let cancelled = false;
    async function initPacketSelection() {
      try {
        await fetchPacketSelection();
      } catch (err) {
        console.error('Failed to load packet selection', err);
        setPacketPersistenceAvailable(false);
      } finally {
        if (!cancelled) setPacketStateLoaded(true);
      }
    }
    initPacketSelection();
    return () => {
      cancelled = true;
    };
  }, [fetchPacketSelection]);

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
      return true;
    } catch (err) {
      console.error('Failed to embed signature', err);
      return false;
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

  const composeWithSelection = useCallback(async (
    nextSelected: Set<string>,
    previousSelected: Set<string>,
    persistSelection: boolean,
  ) => {
    setIsAppendingDocs(true);
    setAttachmentAutofillWarning(null);
    try {
      const nextCloneMap = new Map(attachedCloneBySourceId);
      let effectiveSelected = new Set(nextSelected);
      if (persistSelection) {
        if (packetPersistenceAvailable) {
          const toAttach = Array.from(nextSelected).filter((id) => !previousSelected.has(id));
          const toDetach = Array.from(previousSelected).filter((id) => !nextSelected.has(id));
          const attachmentFailures: string[] = [];
          const attachedWithoutAutofill: string[] = [];
          let attachmentAutofillAnswers: Record<string, string> | null = null;
          let canResolveAutofill = true;

          if (toAttach.length > 0) {
            try {
              const questionsResponse = await getQuestionsV2(applicationId, clientUsername);
              attachmentAutofillAnswers = buildOrgAttachmentAutofillAnswers(questionsResponse.resolvedProfiles);
            } catch {
              canResolveAutofill = false;
            }
          }

          for (let i = 0; i < toAttach.length; i += 1) {
            const id = toAttach[i];
            /* eslint-disable-next-line no-await-in-loop */
            const attachResponse = await fetch(`${getServerURL()}/attach-packet-part`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ applicationId, fileId: id }),
            });
            /* eslint-disable-next-line no-await-in-loop */
            const attachData = await attachResponse.json().catch(() => ({}));
            if (!attachResponse.ok || attachData?.status !== 'SUCCESS') {
              if (attachData?.status === 'NO_SUCH_FILE') {
                setPacketPersistenceAvailable(false);
              }
              attachmentFailures.push(id);
              continue;
            }

            const attachedFileId = typeof attachData?.attachedFileId === 'string'
              ? attachData.attachedFileId
              : undefined;
            if (!attachedFileId) {
              attachmentFailures.push(id);
              continue;
            }
            nextCloneMap.set(id, attachedFileId);

            const hasAutofillAnswers = !!attachmentAutofillAnswers
              && Object.keys(attachmentAutofillAnswers).length > 0;
            if (!canResolveAutofill || !hasAutofillAnswers) {
              attachedWithoutAutofill.push(id);
              continue;
            }

            try {
              /* eslint-disable-next-line no-await-in-loop */
              const filledAttachmentBlob = await fillAttachmentPdfBlob(
                attachedFileId,
                attachmentAutofillAnswers,
                clientUsername,
              );
              /* eslint-disable-next-line no-await-in-loop */
              await updateApplicationAttachmentPdf(filledAttachmentBlob, applicationId, attachedFileId);
            } catch {
              attachedWithoutAutofill.push(id);
            }
          }

          for (let i = 0; i < toDetach.length; i += 1) {
            const sourceId = toDetach[i];
            const id = nextCloneMap.get(sourceId) || sourceId;
            /* eslint-disable-next-line no-await-in-loop */
            const detachResponse = await fetch(`${getServerURL()}/detach-packet-part`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ applicationId, fileId: id }),
            });
            /* eslint-disable-next-line no-await-in-loop */
            const detachData = await detachResponse.json().catch(() => ({}));
            if (!detachResponse.ok || detachData?.status !== 'SUCCESS') {
              if (detachData?.status === 'NO_SUCH_FILE') {
                setPacketPersistenceAvailable(false);
              } else {
                throw new Error(detachData?.message || 'Failed to detach document from application');
              }
            }
            nextCloneMap.delete(sourceId);
          }
          if (attachmentFailures.length > 0) {
            effectiveSelected = new Set(Array.from(nextSelected).filter((id) => !attachmentFailures.includes(id)));
            const failedDocNames = attachmentFailures
              .map((id) => orgDocs.find((doc) => doc.id === id)?.filename || id)
              .join(', ');
            setAttachmentAutofillWarning(
              `Failed to attach: ${failedDocNames}. Other attachment changes were applied.`,
            );
            setStagedDocs(new Set(effectiveSelected));
          }
          if (attachedWithoutAutofill.length > 0) {
            const unfilledDocNames = attachedWithoutAutofill
              .map((id) => orgDocs.find((doc) => doc.id === id)?.filename || id)
              .join(', ');
            const prefix = attachmentFailures.length > 0
              ? 'Some attached without autofill'
              : 'Attached without autofill';
            setAttachmentAutofillWarning(`${prefix}: ${unfilledDocNames}.`);
          }
          setAttachedCloneBySourceId(nextCloneMap);
          await fetchPacketSelection();
        }
      }

      await loadAttachmentPreviews(effectiveSelected, orgDocs, nextCloneMap);
      if (effectiveSelected.size === 0 && livePdfUrl !== fileUrl) {
        const oldUrl = livePdfUrl;
        setLivePdfUrl(fileUrl);
        setPdfVersion((v) => v + 1);
        URL.revokeObjectURL(oldUrl);
      }
      setSelectedDocs((prev) => {
        if (prev.size === effectiveSelected.size && Array.from(prev).every((id) => effectiveSelected.has(id))) {
          return prev;
        }
        return effectiveSelected;
      });
    } catch (err) {
      console.error('Failed to append doc', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to apply attachment changes');
    } finally {
      setIsAppendingDocs(false);
    }
  }, [
    applicationId,
    livePdfUrl,
    fileUrl,
    fetchPacketSelection,
    packetPersistenceAvailable,
    attachedCloneBySourceId,
    orgDocs,
    clientUsername,
    setSaveError,
  ]);

  const applyOrgDocs = useCallback(async () => {
    const nextSelected = new Set(stagedDocs);
    await composeWithSelection(nextSelected, selectedDocs, true);
  }, [composeWithSelection, stagedDocs, selectedDocs]);
  const hasAttachmentSelectionChanges =
    stagedDocs.size !== selectedDocs.size
    || Array.from(stagedDocs).some((id) => !selectedDocs.has(id));

  async function loadAttachmentPreviews(
    selectedIds: Set<string>,
    docsMetadata: { id: string; filename: string }[],
    sourceToCloneMap: Map<string, string>,
  ) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setAttachmentPreviewDocs((prev) => {
        prev.forEach((entry) => URL.revokeObjectURL(entry.url));
        return [];
      });
      return;
    }

    const nextPreviewDocs: Array<{ id: string; sourceFileId: string; url: string; filename: string; pageCount: number }> = [];
    for (let i = 0; i < ids.length; i += 1) {
      const sourceId = ids[i];
      const fileIdToPreview = sourceToCloneMap.get(sourceId) || sourceId;
      /* eslint-disable-next-line no-await-in-loop */
      const res = await fetch(`${getServerURL()}/download-file`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileIdToPreview, fileType: 'ORG_DOCUMENT' }),
      });
      if (res.ok) {
        /* eslint-disable-next-line no-await-in-loop */
        const rawBytes = await res.arrayBuffer();
        // Use independent copies: pdfjs may transfer/detach the provided buffer.
        const pageCountBytes = rawBytes.slice(0);
        const previewBytes = rawBytes.slice(0);
        /* eslint-disable-next-line no-await-in-loop */
        const pageCount = await pdfjs.getDocument({ data: pageCountBytes }).promise.then((pdf) => pdf.numPages).catch(() => 0);
        const filename = docsMetadata.find((doc) => doc.id === sourceId)?.filename || sourceId;
        const url = URL.createObjectURL(new Blob([previewBytes], { type: 'application/pdf' }));
        nextPreviewDocs.push({ id: fileIdToPreview, sourceFileId: sourceId, url, filename, pageCount });
      }
    }
    setAttachmentPreviewDocs((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return nextPreviewDocs;
    });
  }

  useEffect(() => {
    if (!packetStateLoaded || packetSelectionHydrated || selectedDocs.size === 0 || hydrationComposeInFlightRef.current) {
      return;
    }
    hydrationComposeInFlightRef.current = true;
    setPacketSelectionHydrated(true);
    composeWithSelection(new Set(selectedDocs), new Set(), false)
      .catch((err) => {
        console.error('Failed to hydrate packet document composition', err);
      })
      .finally(() => {
        hydrationComposeInFlightRef.current = false;
      });
  }, [packetStateLoaded, packetSelectionHydrated, selectedDocs, composeWithSelection]);

  useEffect(() => {
    if (packetStateLoaded && selectedDocs.size === 0 && !packetSelectionHydrated) {
      setPacketSelectionHydrated(true);
    }
  }, [packetStateLoaded, selectedDocs, packetSelectionHydrated]);

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
    currentViewerPageMeta.doc.kind === 'attachment' && canEditAttachments && !pdfFormsReadOnly;

  const flattenPdfBytes = useCallback(async (bytes: Uint8Array): Promise<Uint8Array> => {
    try {
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      if (fields.length === 0) {
        return bytes;
      }
      form.updateFieldAppearances();
      form.flatten();
      return await pdfDoc.save();
    } catch {
      return bytes;
    }
  }, []);

  const getCurrentPdfBlob = useCallback(async (options: CurrentPdfBlobOptions = {}): Promise<Blob> => {
    const { flattenInteractiveFields = false } = options;
    let bytes: Uint8Array;
    const shouldUseSaveDocument = usePdfJsFormWidgets && !!pdfDocRef.current?.saveDocument && pageNum <= numPages;
    if (shouldUseSaveDocument && pdfDocRef.current?.saveDocument) {
      try {
        bytes = await pdfDocRef.current.saveDocument();
      } catch {
        const res = await fetch(livePdfUrl);
        const buffer = await res.arrayBuffer();
        bytes = new Uint8Array(buffer);
      }
    } else {
      const res = await fetch(livePdfUrl);
      const buffer = await res.arrayBuffer();
      bytes = new Uint8Array(buffer);
    }
    const bytesBeforeFlatten = bytes.byteLength;
    if (flattenInteractiveFields) {
      bytes = await flattenPdfBytes(bytes);
    }
    return toPdfBlob(bytes);
  }, [fileUrl, livePdfUrl, numPages, pageNum, usePdfJsFormWidgets, flattenPdfBytes]);

  const getCurrentAttachmentPdfBlob = useCallback(async (): Promise<Blob> => {
    if (attachmentPdfDocRef.current?.saveDocument && usePdfJsFormWidgets) {
      const bytes = await attachmentPdfDocRef.current.saveDocument();
      return toPdfBlob(bytes);
    }
    const response = await fetch(currentViewerPageMeta.doc.url);
    const bytes = await response.arrayBuffer();
    return new Blob([bytes], { type: 'application/pdf' });
  }, [currentViewerPageMeta.doc.url, usePdfJsFormWidgets]);

  const handlePrint = useCallback(() => {
    // Open a tab synchronously on click so we keep user activation after async blob work.
    // (window.open after await is often blocked; a 0×0 iframe often fails to print PDFs.)
    const printWindow = window.open('about:blank', '_blank');

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
        const blob = await getCurrentPdfBlob({ flattenInteractiveFields: true });
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
              } catch {
                /* ignore */
              }
            }, 300);
          };
          printWindow.addEventListener('load', schedulePrint, { once: true });
          window.setTimeout(schedulePrint, 1500);
          return;
        }

        printWithIframe(objectUrl);
      } catch {
        printWindow?.close();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    })().catch(() => {});
  }, [getCurrentPdfBlob]);

  const handleDownload = useCallback(async () => {
    try {
      const blob = await getCurrentPdfBlob({ flattenInteractiveFields: true });
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
      if (currentViewerPageMeta.doc.kind === 'attachment') {
        if (!canEditAttachments || pdfFormsReadOnly) {
          throw new Error('Attachment editing is not available in this mode.');
        }
        const sourceFileId = currentViewerPageMeta.doc.sourceFileId || currentViewerPageMeta.doc.id;
        const attachmentFileId = attachedCloneBySourceId.get(sourceFileId) || currentViewerPageMeta.doc.id;
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
      onSaveSuccess?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save application');
    } finally {
      setSaving(false);
    }
  }, [
    applicationId,
    attachedCloneBySourceId,
    canEditAttachments,
    clientUsername,
    currentViewerPageMeta.doc,
    formAnswers,
    getCurrentAttachmentPdfBlob,
    getCurrentPdfBlob,
    onSaveSuccess,
    pdfFormsReadOnly,
  ]);

  const handleSavePdfEdits = useCallback(async (): Promise<boolean> => {
    setSaveError(null);
    setPdfEditSavedMessage(null);
    setSavingPdfEdits(true);
    try {
      if (currentViewerPageMeta.doc.kind === 'attachment') {
        if (!canEditAttachments || pdfFormsReadOnly) {
          throw new Error('Attachment editing is not available in this mode.');
        }
        const sourceFileId = currentViewerPageMeta.doc.sourceFileId || currentViewerPageMeta.doc.id;
        const attachmentFileId = attachedCloneBySourceId.get(sourceFileId) || currentViewerPageMeta.doc.id;
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
    attachedCloneBySourceId,
    canEditAttachments,
    clientUsername,
    currentViewerPageMeta.doc,
    fileUrl,
    formAnswers,
    getCurrentAttachmentPdfBlob,
    getCurrentPdfBlob,
    livePdfUrl,
    pdfFormsReadOnly,
  ]);

  const handleCancelPdfEdits = useCallback(() => {
    // Reload the current committed PDF source and discard unsaved in-memory form edits.
    setPdfEditSavedMessage(null);
    setPdfVersion((v) => v + 1);
    setIsPdfEditMode(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentSigDataUrl(null);
    setInlineSigRestoreUrl(null);
    setModalSigSnapshot(null);
    setSigExpandModalOpen(false);
    if (livePdfUrl !== fileUrl) URL.revokeObjectURL(livePdfUrl);
    setLivePdfUrl(fileUrl);
    setPdfVersion((v) => v + 1);
    setEmbeddedBoxes(new Set());
    setSelectedDocs(new Set());
    setStagedDocs(new Set());
    const first = signaturePlacements.length > 0 ? 0 : null;
    setActivePlacementIdx(first);
    if (first !== null) setPageNum(signaturePlacements[first].page + 1);
  }, [livePdfUrl, fileUrl, signaturePlacements]);

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

  useEffect(() => {
    if (pageNum > totalViewerPages) {
      setPageNum(Math.max(1, totalViewerPages));
    }
  }, [pageNum, totalViewerPages]);

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
            ref={frameRef}
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
            {!pdfFormsReadOnly && !isViewingMainPdf && !canEditCurrentAttachment && (
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
                  renderForms={usePdfJsFormWidgets && (isViewingMainPdf || canEditCurrentAttachment)}
                />
              </div>
              {pdfFormsReadOnly && (
                <div
                  className="tw-absolute tw-inset-0 tw-z-30 tw-cursor-not-allowed"
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
      {selectedDocs.size === 0 && activePlacementIdx !== null && !embeddedBoxes.has(activePlacementIdx) && (
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
            {applying ? 'Embedding...' : 'Embed signature'}
          </button>
        </div>
      )}

      {sigExpandModalOpen && activePlacementIdx !== null && !embeddedBoxes.has(activePlacementIdx) && selectedDocs.size === 0 && (
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
                {applying ? 'Embedding...' : 'Embed signature'}
              </button>
            </div>
          </div>
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

      {orgDocs.length > 0 && !pdfFormsReadOnly && (!showPdfEditControls || isPdfEditMode) && (
        <div className="tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-50 tw-px-4 tw-py-3">
          <h4 className="tw-text-sm tw-font-bold tw-text-gray-900 tw-mb-2">Attached Organization Documents</h4>
          {!allSigned ? (
            <div className="tw-p-3 tw-rounded-lg tw-bg-yellow-50 tw-text-yellow-800 tw-text-sm tw-mb-2">
              Please complete all signatures above before appending additional documents to the application.
            </div>
          ) : (
            <>
              <p className="tw-text-xs tw-text-gray-600 tw-mb-3">
                Check the documents you want attached to this application PDF.
                <i> (Note: Any unsaved form modifications may be reset when toggling documents.)</i>
              </p>
              {!packetPersistenceAvailable && (
                <div className="tw-text-xs tw-text-amber-700 tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded tw-p-2 tw-mb-2">
                  Packet persistence is currently unavailable for this application record. Attachment changes are disabled until persistence is restored.
                </div>
              )}
              <div className="tw-flex tw-flex-col tw-gap-2">
                {orgDocs.map((doc) => (
                  <label key={doc.id} className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-gray-800 tw-cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stagedDocs.has(doc.id)}
                      disabled={isAppendingDocs || !packetPersistenceAvailable}
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
                disabled={isAppendingDocs || !hasAttachmentSelectionChanges || !packetPersistenceAvailable}
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
      {attachmentAutofillWarning && (
        <div className="tw-p-3 tw-rounded-lg tw-bg-amber-50 tw-border tw-border-amber-200 tw-text-amber-800 tw-text-sm">
          {attachmentAutofillWarning}
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
