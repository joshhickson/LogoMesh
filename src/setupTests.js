import { expect, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Ensure proper cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () { return null; },
    removeListener: function () { return null; },
  };
};

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  constructor() {

    this.observe = () => {};

    this.unobserve = () => {};

    this.disconnect = () => {};
  }
};