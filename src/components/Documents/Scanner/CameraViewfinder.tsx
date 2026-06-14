import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CornerPoints } from 'scanic';

import type { ScannerPreset } from './scannerPresets';
import { copyFrameToCanvas } from './scannerUtils';

export interface ViewfinderCapture {
  sourceCanvas: HTMLCanvasElement;
  corners: CornerPoints;
}

export interface CameraViewfinderProps {
  preset: ScannerPreset;
  pageNumber: number;
  totalPages: number;
  pageLabel: string;
  onCapture: (capture: ViewfinderCapture) => void;
  onCancel: () => void;
  footer?: React.ReactNode;
}

type PermissionState = 'pending' | 'granted' | 'denied' | 'unsupported';
type FocusRange = { min: number; max: number; step: number };

export default function CameraViewfinder({
  preset,
  pageNumber,
  totalPages,
  pageLabel,
  onCapture,
  onCancel,
  footer,
}: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permission, setPermission] = useState<PermissionState>('pending');
  const [permissionError, setPermissionError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);
  const [focusModes, setFocusModes] = useState<string[]>([]);
  const [focusRange, setFocusRange] = useState<FocusRange | null>(null);
  const [focusValue, setFocusValue] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState<'continuous' | 'manual' | 'none'>('none');

  const handleStreamFailure = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    setPermissionError(msg);
    setPermission('denied');
  }, []);

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (!nav?.mediaDevices?.getUserMedia) {
      setPermission('unsupported');
      return undefined;
    }
    let cancelled = false;
    nav.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setPermission('granted');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Request continuous autofocus on the live track. Many mobile devices
        // default to fixed focus over getUserMedia, which is the root cause of
        // blurry document scans. focusMode is an "advanced" MediaTrack
        // constraint applied after the stream starts; it is unsupported on iOS
        // Safari (which autofocuses anyway) so failures are non-fatal.
        const [track] = stream.getVideoTracks();
        const caps = (track?.getCapabilities?.() ?? {}) as Record<string, unknown>;
        const supportedFocusModes = Array.isArray(caps.focusMode) ? (caps.focusMode as string[]) : [];
        const focusDistance = caps.focusDistance as
          | { min?: number; max?: number; step?: number }
          | undefined;
        setFocusModes(supportedFocusModes);
        if (
          focusDistance
          && typeof focusDistance.min === 'number'
          && typeof focusDistance.max === 'number'
          && focusDistance.max > focusDistance.min
        ) {
          const settings = track?.getSettings?.() as Record<string, unknown> | undefined;
          const current =
            typeof settings?.focusDistance === 'number'
              ? settings.focusDistance
              : (focusDistance.min + focusDistance.max) / 2;
          setFocusRange({
            min: focusDistance.min,
            max: focusDistance.max,
            step: typeof focusDistance.step === 'number' && focusDistance.step > 0
              ? focusDistance.step
              : 0.1,
          });
          setFocusValue(current);
        } else {
          setFocusRange(null);
          setFocusValue(null);
        }
        if (track && supportedFocusModes.includes('continuous')) {
          track
            .applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] })
            .then(() => setFocusMode('continuous'))
            .catch(() => {
              /* device kept its default focus mode — acceptable */
            });
        } else {
          setFocusMode('none');
        }
      })
      .catch(handleStreamFailure);

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [handleStreamFailure]);

  const redrawGuideOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    drawOverlay(overlay, preset);
  }, [preset]);

  const handleVideoReady = useCallback(() => {
    setVideoReady(true);
    redrawGuideOverlay();
  }, [redrawGuideOverlay]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    redrawGuideOverlay();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', redrawGuideOverlay);
      return () => window.removeEventListener('resize', redrawGuideOverlay);
    }
    const observer = new ResizeObserver(() => redrawGuideOverlay());
    observer.observe(container);
    return () => observer.disconnect();
  }, [redrawGuideOverlay]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || !videoReady) return;
    const frame = copyFrameToCanvas(video);
    const corners = buildGuideCorners(video, overlay, preset);
    onCapture({ sourceCanvas: frame, corners });
  }, [onCapture, preset, videoReady]);

  const applyContinuousFocus = useCallback(() => {
    const [track] = streamRef.current?.getVideoTracks() ?? [];
    if (!track || !focusModes.includes('continuous')) return;
    track
      .applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] })
      .then(() => setFocusMode('continuous'))
      .catch((err) => {
        setPermissionError(err instanceof Error ? err.message : String(err));
      });
  }, [focusModes]);

  const applyManualFocus = useCallback((value: number) => {
    const [track] = streamRef.current?.getVideoTracks() ?? [];
    if (!track || !focusRange) return;
    setFocusValue(value);
    track
      .applyConstraints({
        advanced: [
          {
            focusMode: focusModes.includes('manual') ? 'manual' : undefined,
            focusDistance: value,
          } as MediaTrackConstraintSet,
        ],
      })
      .then(() => setFocusMode('manual'))
      .catch((err) => {
        setPermissionError(err instanceof Error ? err.message : String(err));
      });
  }, [focusModes, focusRange]);

  const handleFallbackFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      // Reset so the same file can be selected again after a retake.
      // eslint-disable-next-line no-param-reassign
      input.value = '';
      if (!file) return;
      if ('createImageBitmap' in window) {
        createImageBitmap(file, { imageOrientation: 'from-image' })
          .then((bitmap) => {
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(bitmap, 0, 0);
            bitmap.close();
            onCapture({
              sourceCanvas: canvas,
              corners: centeredGuideCorners(canvas.width, canvas.height, preset),
            });
          })
          .catch(() => {
            loadFallbackImage(file, onCapture, preset);
          });
        return;
      }
      loadFallbackImage(file, onCapture, preset);
    },
    [onCapture, preset],
  );

  if (permission === 'denied' || permission === 'unsupported') {
    return (
      <div className="d-flex flex-column align-items-center p-4">
        <h4 className="mb-3">Camera unavailable</h4>
        <p className="text-muted text-center mb-3">
          {permission === 'unsupported'
            ? 'Your browser does not support live camera capture.'
            : `Camera access was blocked${permissionError ? `: ${permissionError}` : ''}.`}
          {' '}
          Use your phone&apos;s camera app instead.
        </p>
        <label
          className="btn btn-primary btn-lg mb-2"
          htmlFor="scanner-fallback-input"
        >
          Take photo
        </label>
        <input
          id="scanner-fallback-input"
          type="file"
          accept="image/*"
          capture="environment"
          className="d-none"
          onChange={handleFallbackFile}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="position-relative bg-dark text-white d-flex flex-column"
      style={{ minHeight: 'clamp(560px, 90svh, 980px)' }}
    >
      <div className="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center" style={{ zIndex: 3 }}>
        <button
          type="button"
          className="btn btn-sm btn-outline-light"
          onClick={onCancel}
        >
          Cancel
        </button>
        <span className="badge bg-dark bg-opacity-75 fs-6">
          {pageLabel}
          {totalPages > 1 ? ` (${pageNumber} of ${totalPages})` : ''}
        </span>
      </div>

      <div
        className="position-relative w-100 flex-grow-1"
        style={{ minHeight: 'clamp(360px, 72svh, 840px)', background: '#000' }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoReady}
          className="w-100 h-100 position-absolute top-0 start-0"
          style={{ objectFit: 'contain' }}
        />
        <canvas
          ref={overlayRef}
          className="w-100 h-100 position-absolute top-0 start-0"
          style={{ pointerEvents: 'none' }}
        />
        {!videoReady && (
          <div className="position-absolute top-50 start-50 translate-middle text-white">
            Starting camera…
          </div>
        )}
        {focusRange && focusValue !== null && (
          <div
            className="position-absolute start-50 translate-middle-x bg-dark bg-opacity-75 text-white rounded px-3 py-2"
            style={{ bottom: 12, zIndex: 3, width: 'min(92%, 420px)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <label className="small mb-0 text-nowrap" htmlFor="scanner-focus-distance">
                Focus
              </label>
              <input
                id="scanner-focus-distance"
                type="range"
                className="form-range flex-grow-1"
                min={focusRange.min}
                max={focusRange.max}
                step={focusRange.step}
                value={focusValue}
                onChange={(event) => applyManualFocus(Number(event.currentTarget.value))}
                aria-label="Camera focus distance"
              />
              {focusModes.includes('continuous') && (
                <button
                  type="button"
                  className={`btn btn-sm ${focusMode === 'continuous' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={applyContinuousFocus}
                >
                  Auto
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 d-flex flex-column align-items-center" style={{ background: '#000' }}>
        <p className="text-center small text-white-50 mb-3 mb-md-2">
          Place the document on a flat, contrasting surface. Hold steady.
        </p>
        <button
          type="button"
          className="btn btn-light btn-lg rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 72, height: 72 }}
          onClick={handleCapture}
          disabled={!videoReady}
          aria-label="Capture"
        >
          <span
            className="d-inline-block rounded-circle"
            style={{ width: 56, height: 56, border: '3px solid #333' }}
          />
        </button>
        {footer && <div className="mt-3 w-100">{footer}</div>}
      </div>
    </div>
  );
}

function loadFallbackImage(
  file: File,
  onCapture: (capture: ViewfinderCapture) => void,
  preset: ScannerPreset,
) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    onCapture({
      sourceCanvas: canvas,
      corners: centeredGuideCorners(canvas.width, canvas.height, preset),
    });
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function drawOverlay(
  overlay: HTMLCanvasElement,
  preset: ScannerPreset,
) {
  const rect = overlay.getBoundingClientRect();
  if (overlay.width !== rect.width || overlay.height !== rect.height) {
    /* eslint-disable no-param-reassign */
    overlay.width = rect.width;
    overlay.height = rect.height;
    /* eslint-enable no-param-reassign */
  }
  const ctx = overlay.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  // Guide rectangle at preset aspect ratio (skip for freeform)
  if (preset.kind !== 'freeform') {
    drawGuideRectangle(ctx, overlay.width, overlay.height, preset);
  }
}

function drawGuideRectangle(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  preset: ScannerPreset,
) {
  const aspect =
    preset.orientationHint === 'portrait' ? preset.aspectRatio : preset.aspectRatio;
  let guideW: number;
  let guideH: number;
  const maxW = canvasW * (preset.kind === 'letter' ? 0.94 : 0.85);
  const maxH = canvasH * (preset.kind === 'letter' ? 0.94 : 0.85);
  if (preset.orientationHint === 'landscape') {
    guideW = Math.min(maxW, maxH * aspect);
    guideH = guideW / aspect;
  } else {
    guideH = Math.min(maxH, maxW / aspect);
    guideW = guideH * aspect;
  }
  const x = (canvasW - guideW) / 2;
  const y = (canvasH - guideH) / 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(x, y, guideW, guideH);
  ctx.restore();
}

function containFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): { scaleX: number; scaleY: number; offsetX: number; offsetY: number } {
  // Video is drawn with object-fit: contain, so mirror that math for overlay pts.
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let scale: number;
  if (srcRatio > dstRatio) {
    scale = dstW / srcW;
  } else {
    scale = dstH / srcH;
  }
  const renderedW = srcW * scale;
  const renderedH = srcH * scale;
  return {
    scaleX: scale,
    scaleY: scale,
    offsetX: (dstW - renderedW) / 2,
    offsetY: (dstH - renderedH) / 2,
  };
}

function buildGuideCorners(
  video: HTMLVideoElement,
  overlay: HTMLCanvasElement,
  preset: ScannerPreset,
): CornerPoints {
  if (preset.kind === 'freeform') {
    return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: video.videoWidth, y: 0 },
      bottomRight: { x: video.videoWidth, y: video.videoHeight },
      bottomLeft: { x: 0, y: video.videoHeight },
    };
  }
  const overlayRect = overlay.getBoundingClientRect();
  const overlayW = overlayRect.width || overlay.width;
  const overlayH = overlayRect.height || overlay.height;
  const guide = getGuideBounds(overlayW, overlayH, preset);
  const { scaleX, scaleY, offsetX, offsetY } = containFit(
    video.videoWidth,
    video.videoHeight,
    overlayW,
    overlayH,
  );
  const toSource = (x: number, y: number) => ({
    x: clamp((x - offsetX) / scaleX, 0, video.videoWidth),
    y: clamp((y - offsetY) / scaleY, 0, video.videoHeight),
  });
  return {
    topLeft: toSource(guide.x, guide.y),
    topRight: toSource(guide.x + guide.w, guide.y),
    bottomRight: toSource(guide.x + guide.w, guide.y + guide.h),
    bottomLeft: toSource(guide.x, guide.y + guide.h),
  };
}

function centeredGuideCorners(width: number, height: number, preset: ScannerPreset): CornerPoints {
  if (preset.kind === 'freeform') {
    return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: width, y: 0 },
      bottomRight: { x: width, y: height },
      bottomLeft: { x: 0, y: height },
    };
  }
  const guide = getGuideBounds(width, height, preset);
  return {
    topLeft: { x: guide.x, y: guide.y },
    topRight: { x: guide.x + guide.w, y: guide.y },
    bottomRight: { x: guide.x + guide.w, y: guide.y + guide.h },
    bottomLeft: { x: guide.x, y: guide.y + guide.h },
  };
}

function getGuideBounds(canvasW: number, canvasH: number, preset: ScannerPreset): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const aspect =
    preset.orientationHint === 'portrait' ? preset.aspectRatio : preset.aspectRatio;
  let guideW: number;
  let guideH: number;
  const maxW = canvasW * (preset.kind === 'letter' ? 0.94 : 0.85);
  const maxH = canvasH * (preset.kind === 'letter' ? 0.94 : 0.85);
  if (preset.orientationHint === 'landscape') {
    guideW = Math.min(maxW, maxH * aspect);
    guideH = guideW / aspect;
  } else {
    guideH = Math.min(maxH, maxW / aspect);
    guideW = guideH * aspect;
  }
  return {
    x: (canvasW - guideW) / 2,
    y: (canvasH - guideH) / 2,
    w: guideW,
    h: guideH,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
