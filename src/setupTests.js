import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Import RTL screen for global availability
import { screen } from '@testing-library/react';

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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.observe = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.unobserve = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.disconnect = () => {};
  }
};