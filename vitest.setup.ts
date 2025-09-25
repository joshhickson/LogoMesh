import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Ensure proper cleanup after each test
afterEach(() => {
  cleanup();
});

// JSDOM-specific mocks
if (typeof window !== 'undefined') {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: vi.fn(() => [])
  }));

  // Mock window.alert
  window.alert = vi.fn();
}


// --- UNIVERSAL MOCKS ---
// These mocks are safe for both jsdom and node environments.

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(global.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:http://localhost:5173/mock-url'),
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});