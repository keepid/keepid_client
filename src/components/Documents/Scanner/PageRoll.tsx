import React, { useEffect, useMemo } from 'react';

import type { CapturedPage } from './scannerUtils';

export interface PageRollProps {
  pages: CapturedPage[];
  labels: (index: number) => string;
  allowReorder: boolean;
  onReorder?: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onSelect?: (index: number) => void;
}

export default function PageRoll({
  pages,
  labels,
  allowReorder,
  onReorder,
  onRemove,
  onSelect,
}: PageRollProps) {
  const urls = useMemo(() => pages.map((p) => URL.createObjectURL(p.processed)), [pages]);
  useEffect(
    () => () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    },
    [urls],
  );

  if (pages.length === 0) return null;

  return (
    <div className="d-flex gap-2 overflow-auto p-2" style={{ background: '#111' }}>
      {pages.map((page, index) => (
        <div
          key={page.id}
          className="position-relative flex-shrink-0"
          style={{ width: 96 }}
        >
          <button
            type="button"
            className="btn p-0 w-100 overflow-hidden"
            onClick={() => onSelect?.(index)}
            style={{ background: '#fff' }}
            aria-label={`Open ${labels(index)}`}
          >
            <img
              src={urls[index]}
              alt={labels(index)}
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
          </button>
          <div className="small text-center text-white mt-1">{labels(index)}</div>
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute"
            style={{ top: 2, right: 2, padding: '0 6px', lineHeight: '18px' }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            aria-label={`Remove ${labels(index)}`}
          >
            ×
          </button>
          {allowReorder && pages.length > 1 && (
            <div className="d-flex justify-content-between mt-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                style={{ padding: '0 6px' }}
                disabled={index === 0}
                onClick={() => onReorder?.(index, index - 1)}
                aria-label="Move earlier"
              >
                ‹
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                style={{ padding: '0 6px' }}
                disabled={index === pages.length - 1}
                onClick={() => onReorder?.(index, index + 1)}
                aria-label="Move later"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
