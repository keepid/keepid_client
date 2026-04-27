import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CornerPoints } from 'scanic';

import type { ScannerPreset } from './scannerPresets';
import { copyFrameToCanvas, detectCorners, quadAreaRatio } from './scannerUtils';

const DETECTION_INTERVAL_MS = 320;
const MIN_QUAD_COVERAGE = 0.12;

export interface ViewfinderCapture {
  sourceCanvas: HTMLCanvasElement;
  corners: CornerPoints | null;
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
  const detectionRef = useRef<number | null>(null);
  const lastCornersRef = useRef<CornerPoints | null>(null);

  const [permission, setPermission] = useState<PermissionState>('pending');
  const [permissionError, setPermissionError] = useState<string>('');
  const [videoReady, setVideoReady] = useState(false);

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

  useEffect(() => () => {
    if (detectionRef.current !== null) {
      window.clearInterval(detectionRef.current);
      detectionRef.current = null;
    }
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!video || !overlay || !container) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    const scratch = copyFrameToCanvas(video);
    try {
      const corners = await detectCorners(scratch);
      if (!corners) {
        lastCornersRef.current = null;
        drawOverlay(overlay, container, video, null, preset);
        return;
      }
      const ratio = quadAreaRatio(corners, scratch.width, scratch.height);
      const good = ratio >= MIN_QUAD_COVERAGE;
      lastCornersRef.current = good ? corners : null;
      drawOverlay(overlay, container, video, good ? corners : null, preset);
    } catch {
      lastCornersRef.current = null;
    }
  }, [preset]);

  const handleVideoReady = useCallback(() => {
    setVideoReady(true);
    if (detectionRef.current !== null) return;
    detectionRef.current = window.setInterval(runDetection, DETECTION_INTERVAL_MS);
  }, [runDetection]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return;
    const frame = copyFrameToCanvas(video);
    onCapture({ sourceCanvas: frame, corners: lastCornersRef.current });
  }, [onCapture, videoReady]);

  const handleFallbackFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      // Reset so the same file can be selected again after a retake.
      // eslint-disable-next-line no-param-reassign
      input.value = '';
      if (!file) return;
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
        onCapture({ sourceCanvas: canvas, corners: null });
      };
      img.onerror = () => URL.revokeObjectURL(url);
      img.src = url;
    },
    [onCapture],
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
      style={{ minHeight: 420 }}
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

      <div className="position-relative w-100" style={{ aspectRatio: '3 / 4', background: '#000' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoReady}
          className="w-100 h-100 position-absolute top-0 start-0"
          style={{ objectFit: 'cover' }}
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

function drawOverlay(
  overlay: HTMLCanvasElement,
  container: HTMLElement,
  video: HTMLVideoElement,
  corners: CornerPoints | null,
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

  if (corners && video.videoWidth > 0 && video.videoHeight > 0) {
    const { scaleX, scaleY, offsetX, offsetY } = coverFit(
      video.videoWidth,
      video.videoHeight,
      overlay.width,
      overlay.height,
    );
    ctx.beginPath();
    const pts = [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft];
    pts.forEach((p, i) => {
      const x = p.x * scaleX + offsetX;
      const y = p.y * scaleY + offsetY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(72, 207, 173, 0.95)';
    ctx.fillStyle = 'rgba(72, 207, 173, 0.18)';
    ctx.fill();
    ctx.stroke();
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
  // Guide should fit within 80% of the canvas.
  const maxW = canvasW * 0.85;
  const maxH = canvasH * 0.85;
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

function coverFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): { scaleX: number; scaleY: number; offsetX: number; offsetY: number } {
  // Video is drawn with object-fit: cover, so mirror that math for overlay pts.
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  let scale: number;
  if (srcRatio > dstRatio) {
    scale = dstH / srcH;
  } else {
    scale = dstW / srcW;
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
