import { PDFDocument } from 'pdf-lib';
import type { CornerPoints, ScannerResult } from 'scanic';

import type { PdfLayout } from './scannerPresets';

export type FilterMode = 'color' | 'grayscale' | 'bw';

export interface CapturedPage {
  id: string;
  // Original unprocessed source frame, kept so we can re-extract with new corners.
  sourceCanvas: HTMLCanvasElement;
  // Corner points used for the current extraction (may be auto-detected or user-edited).
  corners: CornerPoints;
  // Pixel size requested for the extracted page.
  extractSize: { w: number; h: number };
  // Rotation applied after extraction, in degrees (0/90/180/270).
  rotation: number;
  // Filter applied after extraction.
  filter: FilterMode;
  // Cached processed image blob for preview/PDF.
  processed: Blob;
}

/**
 * Lazily load scanic. Keeps it out of the initial JS bundle for users who never
 * open the scanner. Repeat calls return the already-loaded module.
 */
let scanicPromise: Promise<typeof import('scanic')> | null = null;
export function loadScanic(): Promise<typeof import('scanic')> {
  if (!scanicPromise) {
    scanicPromise = import('scanic');
  }
  return scanicPromise;
}

export function copyFrameToCanvas(source: HTMLVideoElement | HTMLImageElement): HTMLCanvasElement {
  const width =
    source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const height =
    source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function extractWithScanic(
  sourceCanvas: HTMLCanvasElement,
  corners: CornerPoints,
  extractSize: { w: number; h: number },
): Promise<HTMLCanvasElement> {
  const scanic = await loadScanic();
  const result: ScannerResult = await scanic.extractDocument(sourceCanvas, corners, {
    output: 'canvas',
  });
  if (!result.success || !(result.output instanceof HTMLCanvasElement)) {
    throw new Error(result.message || 'Extraction failed');
  }
  const out = result.output;
  // Normalize the extracted quad to the preset's target pixel size so every scan
  // of the same document type comes out at the same dimensions.
  if (out.width === extractSize.w && out.height === extractSize.h) return out;
  const normalized = document.createElement('canvas');
  normalized.width = extractSize.w;
  normalized.height = extractSize.h;
  const ctx = normalized.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.drawImage(out, 0, 0, extractSize.w, extractSize.h);
  return normalized;
}

/**
 * Run auto-detection on a frame and, if found, return the corners.
 * Returns null if scanic couldn't find a quad confidently.
 */
export async function detectCorners(
  frame: HTMLCanvasElement | HTMLImageElement | ImageData,
): Promise<CornerPoints | null> {
  const scanic = await loadScanic();
  const result = await scanic.scanDocument(frame, { mode: 'detect' });
  if (!result.success || !result.corners) return null;
  return result.corners;
}

export function rotateCanvas(
  source: HTMLCanvasElement,
  degrees: number,
): HTMLCanvasElement {
  const norm = ((degrees % 360) + 360) % 360;
  if (norm === 0) return source;
  const rotated = document.createElement('canvas');
  const ctx = rotated.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  if (norm === 180) {
    rotated.width = source.width;
    rotated.height = source.height;
    ctx.translate(source.width, source.height);
    ctx.rotate(Math.PI);
  } else {
    rotated.width = source.height;
    rotated.height = source.width;
    if (norm === 90) {
      ctx.translate(source.height, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      // 270
      ctx.translate(0, source.width);
      ctx.rotate(-Math.PI / 2);
    }
  }
  ctx.drawImage(source, 0, 0);
  return rotated;
}

/**
 * Applies color/grayscale/B&W filter. For B&W we use a simple luminance threshold
 * with a small neighborhood average to approximate adaptive thresholding without
 * the full cost of a real adaptive pass.
 */
export function applyFilter(source: HTMLCanvasElement, filter: FilterMode): HTMLCanvasElement {
  if (filter === 'color') return source;
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, out.width, out.height);
  const d = img.data;

  if (filter === 'grayscale') {
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = y;
      d[i + 1] = y;
      d[i + 2] = y;
    }
  } else {
    // bw: compute luminance, then threshold against a softened global mean
    // biased slightly dark so paper stays white and ink stays black.
    let sum = 0;
    const lum = new Uint8ClampedArray(d.length / 4);
    for (let i = 0, j = 0; i < d.length; i += 4, j += 1) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      lum[j] = y;
      sum += y;
    }
    const mean = sum / lum.length;
    const threshold = Math.max(120, Math.min(200, mean - 10));
    for (let i = 0, j = 0; i < d.length; i += 4, j += 1) {
      const v = lum[j] >= threshold ? 255 : 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode JPEG'));
      },
      'image/jpeg',
      quality,
    );
  });
}

export async function buildCapturedPage(params: {
  sourceCanvas: HTMLCanvasElement;
  corners: CornerPoints;
  extractSize: { w: number; h: number };
  filter: FilterMode;
  rotation?: number;
}): Promise<CapturedPage> {
  const { sourceCanvas, corners, extractSize, filter } = params;
  const rotation = params.rotation ?? 0;
  const extracted = await extractWithScanic(sourceCanvas, corners, extractSize);
  const rotated = rotateCanvas(extracted, rotation);
  const filtered = applyFilter(rotated, filter);
  const processed = await canvasToJpegBlob(filtered);
  return {
    id: generatePageId(),
    sourceCanvas,
    corners,
    extractSize,
    rotation,
    filter,
    processed,
  };
}

function generatePageId(): string {
  // Good enough for ephemeral client-side keys; no security requirement.
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const LETTER_W = 612;
const LETTER_H = 792;
const CARD_PAIR_WIDTH = 460;
const CARD_PAIR_RATIO = 1.586;

export async function pagesToPdf(
  pages: CapturedPage[],
  layout: PdfLayout,
  filename = 'scan.pdf',
): Promise<File> {
  if (pages.length === 0) {
    throw new Error('No pages to assemble');
  }
  const doc = await PDFDocument.create();

  if (layout === 'card-pair') {
    const page = doc.addPage([LETTER_W, LETTER_H]);
    const cardW = CARD_PAIR_WIDTH;
    const cardH = cardW / CARD_PAIR_RATIO;
    const x = (LETTER_W - cardW) / 2;

    const frontBytes = new Uint8Array(await pages[0].processed.arrayBuffer());
    const front = await doc.embedJpg(frontBytes);
    page.drawImage(front, {
      x,
      y: LETTER_H - cardH - 80,
      width: cardW,
      height: cardH,
    });

    if (pages[1]) {
      const backBytes = new Uint8Array(await pages[1].processed.arrayBuffer());
      const back = await doc.embedJpg(backBytes);
      page.drawImage(back, { x, y: 80, width: cardW, height: cardH });
    }
  } else {
    // pdf-lib shares document-level object state, so these pages must be
    // embedded and drawn sequentially rather than in parallel.
    for (let i = 0; i < pages.length; i += 1) {
      const captured = pages[i];
      // eslint-disable-next-line no-await-in-loop
      const bytes = new Uint8Array(await captured.processed.arrayBuffer());
      // eslint-disable-next-line no-await-in-loop
      const img = await doc.embedJpg(bytes);
      const pg = doc.addPage([LETTER_W, LETTER_H]);
      const scale = Math.min(LETTER_W / img.width, LETTER_H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      pg.drawImage(img, {
        x: (LETTER_W - w) / 2,
        y: (LETTER_H - h) / 2,
        width: w,
        height: h,
      });
    }
  }

  const pdfBytes = await doc.save();
  return new File([pdfBytes], filename, { type: 'application/pdf' });
}

/**
 * Returns the intersection-over-union-ish area ratio of the detected quad versus
 * the full frame. Used as a cheap "confidence" signal: tiny quads are probably
 * noise, huge quads are probably good.
 */
export function quadAreaRatio(
  corners: CornerPoints,
  frameWidth: number,
  frameHeight: number,
): number {
  const area = polygonArea([
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft,
  ]);
  const frame = frameWidth * frameHeight;
  return frame > 0 ? area / frame : 0;
}

function polygonArea(points: Array<{ x: number; y: number }>): number {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}
