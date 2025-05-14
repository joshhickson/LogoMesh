import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React components
vi.mock('react-cytoscapejs', () => ({
  default: () => null,
}));

// Mock cytoscape-cose-bilkent
vi.mock('cytoscape-cose-bilkent', () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock window.matchMedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () { return null; },
      removeListener: function () { return null; },
    };
  };

// Configure Jest timeout - vitest doesn't need this
//jest.setTimeout(10000);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock SpeechRecognition API
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
  }
  start() {
    if (this.onstart) this.onstart();
  }
  stop() {
    if (this.onend) this.onend();
  }
}

window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;

window.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
};