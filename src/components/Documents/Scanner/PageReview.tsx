import React, { useEffect, useMemo, useState } from 'react';

import type { CapturedPage, FilterMode } from './scannerUtils';
import { buildCapturedPage } from './scannerUtils';

export interface PageReviewProps {
  page: CapturedPage;
  label: string;
  primaryCta: string;
  secondaryCta?: string;
  onPrimary: (page: CapturedPage) => void;
  onSecondary?: (page: CapturedPage) => void;
  onRetake: () => void;
  onEditCorners: () => void;
  onCancel: () => void;
}

const FILTERS: Array<{ value: FilterMode; label: string }> = [
  { value: 'color', label: 'Color' },
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'bw', label: 'Black & White' },
];

export default function PageReview({
  page,
  label,
  primaryCta,
  secondaryCta,
  onPrimary,
  onSecondary,
  onRetake,
  onEditCorners,
  onCancel,
}: PageReviewProps) {
  const [current, setCurrent] = useState<CapturedPage>(page);
  const [busy, setBusy] = useState(false);

  useEffect(() => setCurrent(page), [page]);

  const previewUrl = useMemo(() => URL.createObjectURL(current.processed), [current.processed]);
  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  const rebuild = async (changes: Partial<Pick<CapturedPage, 'rotation' | 'filter'>>) => {
    setBusy(true);
    try {
      const next = await buildCapturedPage({
        sourceCanvas: current.sourceCanvas,
        corners: current.corners,
        extractSize: current.extractSize,
        filter: changes.filter ?? current.filter,
        rotation: changes.rotation ?? current.rotation,
      });
      next.id = current.id;
      setCurrent(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex flex-column bg-dark text-white">
      <div className="p-2 d-flex justify-content-between align-items-center" style={{ background: '#111' }}>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={onCancel}>
          Cancel
        </button>
        <span className="small">{label}</span>
        <button
          type="button"
          className="btn btn-sm btn-outline-light"
          onClick={onEditCorners}
          disabled={busy}
        >
          Adjust corners
        </button>
      </div>

      <div className="p-3 d-flex justify-content-center" style={{ background: '#222' }}>
        <img
          src={previewUrl}
          alt="Extracted document page"
          style={{ maxWidth: '100%', maxHeight: '55vh', background: '#fff' }}
        />
      </div>

      <div className="p-3 d-flex flex-column gap-3" style={{ background: '#111' }}>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`btn btn-sm ${current.filter === f.value ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => rebuild({ filter: f.value })}
              disabled={busy || current.filter === f.value}
            >
              {f.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={() => rebuild({ rotation: (current.rotation + 90) % 360 })}
            disabled={busy}
          >
            Rotate 90°
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-between">
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={onRetake}
            disabled={busy}
          >
            Retake
          </button>
          <div className="d-flex flex-wrap gap-2 ms-auto">
            {secondaryCta && onSecondary && (
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => onSecondary(current)}
                disabled={busy}
              >
                {secondaryCta}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onPrimary(current)}
              disabled={busy}
            >
              {primaryCta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
