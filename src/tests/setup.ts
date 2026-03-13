import '@testing-library/jest-dom';

import { vi } from 'vitest';

globalThis.jest = vi;

// pdfjs-dist (react-pdf) requires DOMMatrix, which jsdom does not provide
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;

    b = 0;

    c = 0;

    d = 1;

    e = 0;

    f = 0;

    constructor(init?: string | number[]) {
      if (init && typeof init === 'string') {
        const m = init.match(/matrix\(([^)]+)\)/);
        if (m) {
          const c = m[1].split(',').map(Number);
          [this.a, this.b, this.c, this.d, this.e, this.f] = c;
        }
      }
    }
  };
}
