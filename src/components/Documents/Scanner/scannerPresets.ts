import { IdCategories } from '../IdCategories';

export type ScannerPresetKind = 'card' | 'letter' | 'freeform';
export type PdfLayout = 'card-pair' | 'one-per-page';

export interface ScannerPreset {
  kind: ScannerPresetKind;
  aspectRatio: number;
  extractSize: { w: number; h: number };
  defaultPages: number;
  maxPages: number;
  pageLabels?: string[];
  pdfLayout: PdfLayout;
  orientationHint: 'landscape' | 'portrait';
}

// Credit-card size at ~200dpi
const CREDIT_CARD: Pick<ScannerPreset, 'kind' | 'aspectRatio' | 'extractSize' | 'orientationHint' | 'pdfLayout'> = {
  kind: 'card',
  aspectRatio: 1.586,
  extractSize: { w: 1015, h: 640 },
  orientationHint: 'landscape',
  pdfLayout: 'card-pair',
};

// US SS card is wider and shorter than a credit card (~3.5" x 2.5")
const SS_CARD: Pick<ScannerPreset, 'kind' | 'aspectRatio' | 'extractSize' | 'orientationHint' | 'pdfLayout'> = {
  kind: 'card',
  aspectRatio: 1.4,
  extractSize: { w: 980, h: 700 },
  orientationHint: 'landscape',
  pdfLayout: 'card-pair',
};

// CDC vaccine card (~4" x 3")
const VACCINE_CARD: Pick<ScannerPreset, 'kind' | 'aspectRatio' | 'extractSize' | 'orientationHint' | 'pdfLayout'> = {
  kind: 'card',
  aspectRatio: 1.333,
  extractSize: { w: 960, h: 720 },
  orientationHint: 'landscape',
  pdfLayout: 'card-pair',
};

// Letter 8.5 x 11 at ~200dpi
const LETTER: Pick<ScannerPreset, 'kind' | 'aspectRatio' | 'extractSize' | 'orientationHint' | 'pdfLayout'> = {
  kind: 'letter',
  aspectRatio: 8.5 / 11,
  extractSize: { w: 1700, h: 2200 },
  orientationHint: 'portrait',
  pdfLayout: 'one-per-page',
};

const FREEFORM: Pick<ScannerPreset, 'kind' | 'aspectRatio' | 'extractSize' | 'orientationHint' | 'pdfLayout'> = {
  kind: 'freeform',
  aspectRatio: 8.5 / 11,
  extractSize: { w: 1700, h: 2200 },
  orientationHint: 'portrait',
  pdfLayout: 'one-per-page',
};

const TWO_SIDED_LABELS = ['Front', 'Back'];

export const SCANNER_PRESETS: Record<IdCategories, ScannerPreset> = {
  [IdCategories.DriversLicense]: {
    ...CREDIT_CARD,
    defaultPages: 2,
    maxPages: 2,
    pageLabels: TWO_SIDED_LABELS,
  },
  [IdCategories.MedicaidCard]: {
    ...CREDIT_CARD,
    defaultPages: 2,
    maxPages: 2,
    pageLabels: TWO_SIDED_LABELS,
  },
  [IdCategories.VeteranIDCard]: {
    ...CREDIT_CARD,
    defaultPages: 2,
    maxPages: 2,
    pageLabels: TWO_SIDED_LABELS,
  },
  [IdCategories.SocialSecurityCard]: {
    ...SS_CARD,
    defaultPages: 2,
    maxPages: 2,
    pageLabels: TWO_SIDED_LABELS,
  },
  [IdCategories.VaccineCard]: {
    ...VACCINE_CARD,
    defaultPages: 2,
    maxPages: 2,
    pageLabels: TWO_SIDED_LABELS,
  },
  [IdCategories.BirthCertificate]: {
    ...LETTER,
    defaultPages: 1,
    maxPages: 3,
  },
  [IdCategories.IdMeRecoveryCodes]: {
    ...LETTER,
    defaultPages: 1,
    maxPages: 3,
  },
  [IdCategories.SchoolTranscript]: {
    ...LETTER,
    defaultPages: 1,
    maxPages: 20,
  },
  [IdCategories.Other]: {
    ...FREEFORM,
    defaultPages: 1,
    maxPages: 20,
  },
};

export function presetFor(category: IdCategories | string | undefined): ScannerPreset | null {
  if (!category) return null;
  return SCANNER_PRESETS[category as IdCategories] ?? null;
}

export function pageLabel(preset: ScannerPreset, index: number): string {
  if (preset.pageLabels && index < preset.pageLabels.length) {
    return preset.pageLabels[index];
  }
  return `Page ${index + 1}`;
}
