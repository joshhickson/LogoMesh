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
    this.observe = () => {};
    this.unobserve = () => {};
    this.disconnect = () => {};
  }
};