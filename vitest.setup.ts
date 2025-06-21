
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Make vi globally available as jest for compatibility
global.jest = vi;

// ==============================================
// COMPREHENSIVE BROWSER API MOCKING
// ==============================================

// Speech Recognition APIs
const createMockSpeechRecognition = () => ({
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  onresult: null,
  onerror: null,
  onstart: null,
  onend: null
});

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(createMockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(createMockSpeechRecognition),
});

// File/Blob/URL APIs
Object.defineProperty(window, 'URL', {
  writable: true,
  configurable: true,
  value: {
    createObjectURL: vi.fn().mockReturnValue('mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

Object.defineProperty(window, 'Blob', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((content, options) => ({
    size: content ? content.join('').length : 0,
    type: options?.type || '',
    text: vi.fn().mockResolvedValue(content ? content.join('') : ''),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  })),
});

// Canvas API
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
    }),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    resetTransform: vi.fn(),
  }),
});

// Anchor element properties (for download functionality)
Object.defineProperty(HTMLAnchorElement.prototype, 'href', {
  writable: true,
  configurable: true,
  value: '',
});

Object.defineProperty(HTMLAnchorElement.prototype, 'download', {
  writable: true,
  configurable: true,
  value: '',
});

Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

// Alert and other dialog APIs
window.alert = vi.fn();
window.confirm = vi.fn();
window.prompt = vi.fn();

// Cytoscape mock (for Canvas component)
vi.mock('cytoscape', () => {
  return {
    default: vi.fn().mockReturnValue({
      mount: vi.fn(),
      unmount: vi.fn(),
      layout: vi.fn().mockReturnValue({
        run: vi.fn(),
      }),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      getElementById: vi.fn(),
      nodes: vi.fn().mockReturnValue([]),
      edges: vi.fn().mockReturnValue([]),
    }),
  };
});

// React-cytoscapejs mock
vi.mock('react-cytoscapejs', () => {
  return {
    default: vi.fn().mockImplementation(() => null),
  };
});

// ==============================================
// GLOBAL TEST UTILITIES
// ==============================================

// Helper function to create properly configured property mocks
global.createConfigurableProperty = (object, property, value) => {
  Object.defineProperty(object, property, {
    writable: true,
    configurable: true,
    value,
  });
};

// Helper to reset all mocks between tests
global.resetAllMocks = () => {
  vi.clearAllMocks();
  // Reset any global state that tests might have modified
};

// Auto-reset mocks after each test
afterEach(() => {
  global.resetAllMocks();
});
