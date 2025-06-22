import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

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