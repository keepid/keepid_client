import React, { useCallback, useMemo, useState } from 'react';

import type { ViewfinderCapture } from './CameraViewfinder';
import CameraViewfinder from './CameraViewfinder';
import PageReview from './PageReview';
import PageRoll from './PageRoll';
import { type ScannerPreset, pageLabel as presetPageLabel } from './scannerPresets';
import type { CapturedPage } from './scannerUtils';
import { buildCapturedPage, pagesToPdf } from './scannerUtils';

type Stage =
  | { kind: 'capturing'; index: number }
  | { kind: 'reviewing'; page: CapturedPage; replacingIndex: number | null }
  | { kind: 'assembling' }
  | { kind: 'error'; message: string };

export interface DocumentScannerProps {
  preset: ScannerPreset;
  filenameHint?: string;
  onComplete: (file: File) => void;
  onCancel: () => void;
}

export default function DocumentScanner({
  preset,
  filenameHint,
  onComplete,
  onCancel,
}: DocumentScannerProps) {
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [stage, setStage] = useState<Stage>({ kind: 'capturing', index: 0 });

  const rollSize = pages.length;
  const nextPageIndex = stage.kind === 'capturing' ? stage.index : rollSize;
  const isCard = preset.kind === 'card';
  const labelFor = (index: number) => presetPageLabel(preset, index);

  const buildPage = useCallback(
    async (
      frame: HTMLCanvasElement,
      corners: CornerPoints,
      replacingIndex: number | null,
    ) => {
      try {
        const carriedFilter = replacingIndex !== null ? pages[replacingIndex].filter : 'color';
        const carriedRotation = replacingIndex !== null ? pages[replacingIndex].rotation : 0;
        const page = await buildCapturedPage({
          sourceCanvas: frame,
          corners,
          extractSize: preset.extractSize,
          filter: carriedFilter,
          rotation: carriedRotation,
        });
        setStage({ kind: 'reviewing', page, replacingIndex });
      } catch (err) {
        setStage({
          kind: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Could not process that frame. Please retake the photo.',
        });
      }
    },
    [pages, preset.extractSize],
  );

  const handleCapture = useCallback(
    async ({ sourceCanvas, corners }: ViewfinderCapture) => {
      await buildPage(sourceCanvas, corners, null);
    },
    [buildPage],
  );

  const commitPage = useCallback(
    (page: CapturedPage, replacingIndex: number | null) => {
      setPages((prev) => {
        if (replacingIndex === null) return [...prev, page];
        const copy = prev.slice();
        copy[replacingIndex] = page;
        return copy;
      });
    },
    [],
  );

  const finishAssembly = useCallback(
    async (finalPages: CapturedPage[]) => {
      if (finalPages.length === 0) return;
      setStage({ kind: 'assembling' });
      try {
        const file = await pagesToPdf(
          finalPages,
          preset.pdfLayout,
          filenameHint ? `${filenameHint}.pdf` : 'scan.pdf',
        );
        onComplete(file);
      } catch (err) {
        setStage({
          kind: 'error',
          message:
            err instanceof Error ? err.message : 'Could not assemble the PDF.',
        });
      }
    },
    [filenameHint, onComplete, preset.pdfLayout],
  );

  const handleReviewPrimary = useCallback(
    (page: CapturedPage) => {
      const isReplacement = stage.kind === 'reviewing' ? stage.replacingIndex !== null : false;
      const replacingIndex =
        stage.kind === 'reviewing' ? stage.replacingIndex : null;
      const nextPages = (() => {
        if (replacingIndex === null) return [...pages, page];
        const copy = pages.slice();
        copy[replacingIndex] = page;
        return copy;
      })();

      commitPage(page, replacingIndex);

      // Decide what happens next based on preset + current roll size.
      const newCount = nextPages.length;
      if (isCard) {
        // Two-sided card: advance to back after front; auto-assemble after back.
        if (newCount >= preset.defaultPages) {
          finishAssembly(nextPages);
          return;
        }
        setStage({ kind: 'capturing', index: newCount });
        return;
      }
      // Letter/freeform: primary CTA = Done unless it's a replacement;
      // if replacement, stay on the review screen is surprising, so we just return to viewfinder.
      if (isReplacement) {
        setStage({ kind: 'capturing', index: newCount });
        return;
      }
      finishAssembly(nextPages);
    },
    [commitPage, finishAssembly, isCard, pages, preset.defaultPages, stage],
  );

  const handleReviewSecondary = useCallback(
    (page: CapturedPage) => {
      const replacingIndex =
        stage.kind === 'reviewing' ? stage.replacingIndex : null;
      const nextPages = (() => {
        if (replacingIndex === null) return [...pages, page];
        const copy = pages.slice();
        copy[replacingIndex] = page;
        return copy;
      })();
      commitPage(page, replacingIndex);
      const newCount = nextPages.length;
      if (isCard) {
        // Secondary on a card = "Done with just front"; assemble now.
        finishAssembly(nextPages);
        return;
      }
      // Secondary on letter = "Add another page"
      if (newCount >= preset.maxPages) {
        finishAssembly(nextPages);
        return;
      }
      setStage({ kind: 'capturing', index: newCount });
    },
    [commitPage, finishAssembly, isCard, pages, preset.maxPages, stage],
  );

  const handleRetake = useCallback(() => {
    setStage({ kind: 'capturing', index: rollSize });
  }, [rollSize]);

  const handleRemovePage = useCallback((index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleReorderPage = useCallback((from: number, to: number) => {
    setPages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = prev.slice();
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }, []);

  const handleSelectPage = useCallback(
    (index: number) => {
      const page = pages[index];
      if (!page) return;
      setStage({ kind: 'reviewing', page, replacingIndex: index });
    },
    [pages],
  );

  const handleDone = useCallback(() => {
    if (pages.length === 0) return;
    finishAssembly(pages);
  }, [finishAssembly, pages]);

  const viewfinderFooter = useMemo(() => {
    if (stage.kind !== 'capturing') return null;
    const showDoneShortcut = !isCard && pages.length > 0;
    if (!showDoneShortcut) return null;
    return (
      <div className="d-flex justify-content-between w-100 align-items-center">
        <span className="small text-white-50">
          {pages.length} page{pages.length === 1 ? '' : 's'} captured
        </span>
        <button type="button" className="btn btn-success" onClick={handleDone}>
          Done ({pages.length})
        </button>
      </div>
    );
  }, [handleDone, isCard, pages.length, stage.kind]);

  const reviewCtas = useMemo(() => {
    if (stage.kind !== 'reviewing') {
      return { primary: 'Use this page', secondary: undefined as string | undefined };
    }
    const isReplacement = stage.replacingIndex !== null;
    if (isReplacement) {
      return { primary: 'Save changes', secondary: undefined };
    }
    if (isCard) {
      const capturedSoFar = pages.length + 1;
      if (capturedSoFar >= preset.defaultPages) {
        return { primary: 'Upload', secondary: undefined };
      }
      return { primary: 'Add back side', secondary: 'Upload just front' };
    }
    return { primary: 'Done', secondary: 'Add another page' };
  }, [isCard, pages.length, preset.defaultPages, stage]);

  if (stage.kind === 'assembling') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 bg-dark text-white">
        <div className="spinner-border text-light mb-3" role="status" aria-hidden />
        <p>Assembling your PDF…</p>
      </div>
    );
  }

  if (stage.kind === 'error') {
    return (
      <div className="d-flex flex-column align-items-center p-4 bg-dark text-white">
        <h5 className="mb-3">Something went wrong</h5>
        <p className="text-center mb-3">{stage.message}</p>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={() => setStage({ kind: 'capturing', index: pages.length })}
          >
            Try again
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (stage.kind === 'reviewing') {
    return (
      <div>
        <PageReview
          page={stage.page}
          label={
            stage.replacingIndex !== null
              ? `Editing ${labelFor(stage.replacingIndex)}`
              : `Review ${labelFor(nextPageIndex)}`
          }
          primaryCta={reviewCtas.primary}
          secondaryCta={reviewCtas.secondary}
          onPrimary={handleReviewPrimary}
          onSecondary={reviewCtas.secondary ? handleReviewSecondary : undefined}
          onRetake={handleRetake}
          simplifiedActions={isCard && stage.replacingIndex === null && pages.length === 0}
          onCancel={onCancel}
        />
        <PageRoll
          pages={pages}
          labels={labelFor}
          allowReorder={!isCard}
          onReorder={handleReorderPage}
          onRemove={handleRemovePage}
          onSelect={handleSelectPage}
        />
      </div>
    );
  }

  return (
    <div>
      <CameraViewfinder
        preset={preset}
        pageNumber={nextPageIndex + 1}
        totalPages={isCard ? preset.defaultPages : 0}
        pageLabel={labelFor(nextPageIndex)}
        onCapture={handleCapture}
        onCancel={onCancel}
        footer={viewfinderFooter}
      />
      <PageRoll
        pages={pages}
        labels={labelFor}
        allowReorder={!isCard}
        onReorder={handleReorderPage}
        onRemove={handleRemovePage}
        onSelect={handleSelectPage}
      />
    </div>
  );
}
