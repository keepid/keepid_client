import '@testing-library/jest-dom';

import { vi } from 'vitest';

globalThis.jest = vi;

const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);
