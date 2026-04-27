import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CornerPoints } from 'scanic';

export interface ManualCornerEditorProps {
  sourceCanvas: HTMLCanvasElement;
  initialCorners: CornerPoints | null;
  onConfirm: (corners: CornerPoints) => void;
  onCancel: () => void;
}

type CornerKey = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
const CORNER_ORDER: CornerKey[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

export default function ManualCornerEditor({
  sourceCanvas,
  initialCorners,
  onConfirm,
  onCancel,
}: ManualCornerEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [corners, setCorners] = useState<CornerPoints>(() =>
    initialCorners ?? defaultCorners(sourceCanvas.width, sourceCanvas.height));
  const dataUrl = useMemo(() => sourceCanvas.toDataURL('image/jpeg', 0.85), [sourceCanvas]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setDisplaySize({ w: rect.width, h: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scaleX = displaySize.w > 0 ? displaySize.w / sourceCanvas.width : 1;
  const scaleY = displaySize.h > 0 ? displaySize.h / sourceCanvas.height : 1;

  const draggingRef = useRef<CornerKey | null>(null);

  const onPointerDown = (key: CornerKey) => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    draggingRef.current = key;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const key = draggingRef.current;
    if (!key) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setCorners((prev) => ({
      ...prev,
      [key]: {
        x: x / scaleX,
        y: y / scaleY,
      },
    }));
  };

  const onPointerUp = () => {
    draggingRef.current = null;
  };

  const overlayPath = `${CORNER_ORDER.map((k, i) => {
    const p = corners[k];
    const dx = p.x * scaleX;
    const dy = p.y * scaleY;
    return `${i === 0 ? 'M' : 'L'} ${dx},${dy}`;
  }).join(' ')} Z`;

  return (
    <div className="d-flex flex-column bg-dark text-white">
      <div className="p-2 d-flex justify-content-between align-items-center" style={{ background: '#111' }}>
        <button type="button" className="btn btn-sm btn-outline-light" onClick={onCancel}>
          Cancel
        </button>
        <span className="small">Drag corners to fit the document</span>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => onConfirm(corners)}
        >
          Done
        </button>
      </div>
      <div
        ref={containerRef}
        className="position-relative mx-auto"
        style={{
          maxWidth: '100%',
          width: '100%',
          aspectRatio: `${sourceCanvas.width} / ${sourceCanvas.height}`,
          touchAction: 'none',
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={dataUrl}
          alt="Captured document"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: 'fill', userSelect: 'none', pointerEvents: 'none' }}
          draggable={false}
        />
        <svg
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ pointerEvents: 'none' }}
        >
          <path
            d={overlayPath}
            fill="rgba(72, 207, 173, 0.18)"
            stroke="rgba(72, 207, 173, 0.95)"
            strokeWidth={3}
          />
        </svg>
        {CORNER_ORDER.map((key) => {
          const p = corners[key];
          const left = p.x * scaleX;
          const top = p.y * scaleY;
          return (
            <button
              key={key}
              type="button"
              aria-label={`Adjust ${key}`}
              onPointerDown={onPointerDown(key)}
              className="position-absolute rounded-circle border-0"
              style={{
                left: left - 18,
                top: top - 18,
                width: 36,
                height: 36,
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 0 0 3px rgba(72, 207, 173, 0.95)',
                touchAction: 'none',
                cursor: 'grab',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function defaultCorners(w: number, h: number): CornerPoints {
  const insetX = w * 0.1;
  const insetY = h * 0.1;
  return {
    topLeft: { x: insetX, y: insetY },
    topRight: { x: w - insetX, y: insetY },
    bottomRight: { x: w - insetX, y: h - insetY },
    bottomLeft: { x: insetX, y: h - insetY },
  };
}
