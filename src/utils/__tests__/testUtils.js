
import { vi } from 'vitest';

/**
 * Unified Test Utilities for LogoMesh
 * Provides consistent mocking patterns across all test files
 */

// ==============================================
// BROWSER API HELPERS
// ==============================================

export const mockSpeechRecognition = () => {
  const mockRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    onresult: null,
    onerror: null,
    onstart: null,
    onend: null,
    continuous: false,
    interimResults: false,
  };

  global.createConfigurableProperty(window, 'webkitSpeechRecognition', 
    vi.fn(() => mockRecognition)
  );

  return mockRecognition;
};

export const mockFileAPIs = () => {
  const mockFile = {
    name: 'test.json',
    type: 'application/json',
    size: 100,
  };

  const mockReader = {
    readAsText: vi.fn(),
    onload: null,
    onerror: null,
    result: '{"test": "data"}',
  };

  global.createConfigurableProperty(window, 'FileReader', 
    vi.fn(() => mockReader)
  );

  return { mockFile, mockReader };
};

export const mockCanvasContext = () => {
  const mockContext = {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn().mockReturnValue({
      data: new Uint8ClampedArray(4),
    }),
    putImageData: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 10 }),
  };

  return mockContext;
};

// ==============================================
// DOM TESTING HELPERS
// ==============================================

export const createMockElement = (tagName, properties = {}) => {
  const element = document.createElement(tagName);
  
  Object.entries(properties).forEach(([key, value]) => {
    global.createConfigurableProperty(element, key, value);
  });

  return element;
};

export const simulateUserInteraction = {
  click: (element) => {
    element.click?.();
    element.dispatchEvent?.(new Event('click'));
  },
  
  input: (element, value) => {
    element.value = value;
    element.dispatchEvent?.(new Event('input'));
  },

  keydown: (element, key) => {
    element.dispatchEvent?.(new KeyboardEvent('keydown', { key }));
  },
};

// ==============================================
// API MOCKING HELPERS
// ==============================================

export const mockApiResponse = (data, status = 200) => ({
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
});

export const mockFetchResponse = (data, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue(mockApiResponse(data, status));
  return global.fetch;
};

// ==============================================
// TEST SCENARIO BUILDERS
// ==============================================

export const buildTestScenario = (name, setup = {}) => {
  return {
    name,
    setup: () => {
      // Apply any custom setup
      Object.entries(setup).forEach(([key, value]) => {
        if (typeof value === 'function') {
          value();
        }
      });
    },
    teardown: () => {
      // Cleanup any test-specific mocks
      global.resetAllMocks();
    },
  };
};

export default {
  mockSpeechRecognition,
  mockFileAPIs,
  mockCanvasContext,
  createMockElement,
  simulateUserInteraction,
  mockApiResponse,
  mockFetchResponse,
  buildTestScenario,
};
