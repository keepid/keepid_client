import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../InteractiveForms/sign-and-download-viewer.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Document, Page, pdfjs } from 'react-pdf';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

interface Props {
  pdfFile: File;
}

/**
 * Same PDF chrome as applications preview (SignAndDownloadViewer): gray frame,
 * page strip with Prev / Page n / m / Next, and read-only page render.
 */
export default function ApplicationStylePdfViewer({ pdfFile }: Props): React.ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(560);
  const [numPages, setNumPages] = useState(1);
  const [pageNum, setPageNum] = useState(1);

  const fileUrl = useMemo(() => URL.createObjectURL(pdfFile), [pdfFile]);

  useEffect(() => {
    setPageNum(1);
    setNumPages(1);
  }, [fileUrl]);

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl);
    },
    [fileUrl],
  );

  useEffect(() => {
    const el = frameRef.current;
    if (!el) {
      return undefined;
    }
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setFrameWidth(w);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fileUrl]);

  useEffect(() => {
    if (pageNum > numPages) {
      setPageNum(Math.max(1, numPages));
    }
  }, [pageNum, numPages]);

  const renderedWidth = Math.max(100, frameWidth - 2);
  const pageDevicePixelRatio = typeof window === 'undefined'
    ? 2
    : Math.max(window.devicePixelRatio || 1, 2);
  const totalViewerPages = numPages;

  return (
    <div className="tw-flex tw-w-full tw-flex-col tw-items-start tw-gap-8">
      <Helmet>
        <title>
          Document:
          {pdfFile.name}
        </title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div
        ref={frameRef}
        className="tw-w-full"
      >
        <div className="keepid-pdf-preview keepid-pdf-edit-locked tw-w-full tw-space-y-4">
          <Document
            file={fileUrl}
            onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
            loading={(
              <div className="tw-flex tw-h-64 tw-items-center tw-justify-center tw-text-gray-400">
                Loading PDF…
              </div>
            )}
            error={(
              <div className="tw-py-8 tw-text-center tw-text-red-600">
                Could not display this PDF. Try Download instead.
              </div>
            )}
          >
            <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
              <div className="tw-w-full tw-max-w-4xl tw-overflow-hidden tw-rounded-xl tw-border tw-border-gray-200 tw-bg-gray-200 tw-shadow-sm">
                <div className="tw-flex tw-items-center tw-justify-between tw-bg-gray-200 tw-px-2 tw-py-2 sm:tw-px-3 sm:tw-py-1 sm:tw-pt-2">
                <button
                  type="button"
                  onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                  disabled={totalViewerPages <= 1 || pageNum <= 1}
                  className={`tw-flex tw-min-h-12 tw-min-w-[5.5rem] tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border-0 tw-bg-white tw-px-3 tw-text-base tw-font-semibold tw-text-gray-800 tw-shadow-sm active:tw-bg-gray-100 disabled:tw-opacity-40 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500 focus-visible:tw-ring-offset-2 sm:tw-min-h-0 sm:tw-min-w-0 sm:tw-rounded-none sm:tw-bg-transparent sm:tw-px-0 sm:tw-py-0 sm:tw-text-sm sm:tw-font-normal sm:tw-text-gray-600 sm:tw-shadow-none sm:hover:tw-text-gray-800 sm:active:tw-bg-transparent sm:focus-visible:tw-ring-0 sm:focus-visible:tw-ring-offset-0 ${totalViewerPages <= 1 ? 'tw-invisible' : ''}`}
                >
                  &larr; Prev
                </button>
                <span className="tw-px-2 tw-text-center tw-text-base tw-font-semibold tw-text-gray-800 sm:tw-text-sm sm:tw-font-normal sm:tw-text-gray-700">
                  Page
                  {' '}
                  {pageNum}
                  {' '}
                  /
                  {' '}
                  {totalViewerPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPageNum((p) => Math.min(totalViewerPages, p + 1))}
                  disabled={totalViewerPages <= 1 || pageNum >= totalViewerPages}
                  className={`tw-flex tw-min-h-12 tw-min-w-[5.5rem] tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border-0 tw-bg-white tw-px-3 tw-text-base tw-font-semibold tw-text-gray-800 tw-shadow-sm active:tw-bg-gray-100 disabled:tw-opacity-40 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500 focus-visible:tw-ring-offset-2 sm:tw-min-h-0 sm:tw-min-w-0 sm:tw-rounded-none sm:tw-bg-transparent sm:tw-px-0 sm:tw-py-0 sm:tw-text-sm sm:tw-font-normal sm:tw-text-gray-600 sm:tw-shadow-none sm:hover:tw-text-gray-800 sm:active:tw-bg-transparent sm:focus-visible:tw-ring-0 sm:focus-visible:tw-ring-offset-0 ${totalViewerPages <= 1 ? 'tw-invisible' : ''}`}
                >
                  Next &rarr;
                </button>
                </div>
              <div className="tw-relative tw-bg-gray-200 tw-px-1 tw-pb-1">
                <div className="tw-w-full tw-overflow-hidden tw-rounded tw-bg-gray-100">
                  <Page
                    key={`doc-page-${pageNum}`}
                    pageNumber={pageNum}
                    width={renderedWidth > 0 ? renderedWidth : undefined}
                    devicePixelRatio={pageDevicePixelRatio}
                    renderAnnotationLayer
                    renderTextLayer
                    renderForms={false}
                  />
                </div>
                <div
                  className="tw-absolute tw-inset-0 tw-z-30 tw-cursor-not-allowed"
                  title="PDF is read-only."
                />
              </div>
              </div>
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
}
