import { expect, afterEach, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Ensure proper cleanup after each test
afterEach(() => {
  cleanup();
});

// All browser-specific mocks should be inside this conditional block
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () { return null; },
      removeListener: function () { return null; },
    };
  };

  // Mock ResizeObserver for browser-like environments
  window.ResizeObserver = window.ResizeObserver || class ResizeObserver {
    constructor() {
      this.observe = () => {};
      this.unobserve = () => {};
      this.disconnect = () => {};
    }
  };

  // Mock window.alert globally
  global.alert = vi.fn();

  // Mock speech recognition with comprehensive implementation
  const mockSpeechRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    onresult: null,
    onerror: null,
    onend: null,
    onstart: null,
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    maxAlternatives: 1
  };

  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: vi.fn(() => mockSpeechRecognition),
    configurable: true,
    writable: true
  });

  Object.defineProperty(window, 'SpeechRecognition', {
    value: vi.fn(() => mockSpeechRecognition),
    configurable: true,
    writable: true
  });

  // Simplified createElement mock - only mock specific elements that need it
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = vi.fn((tagName) => {
    const element = originalCreateElement(tagName);

    if (tagName === 'a') {
      // Mock anchor element with proper property descriptors
      let _href = '';
      let _download = '';

      Object.defineProperty(element, 'href', {
        get: function() { return _href; },
        set: function(value) { _href = value; },
        configurable: true,
        enumerable: true
      });

      Object.defineProperty(element, 'download', {
        get: function() { return _download; },
        set: function(value) { _download = value; },
        configurable: true,
        enumerable: true
      });

      // Add other anchor properties
      element.click = vi.fn();
      element.remove = vi.fn();
    }

    // Minimal input mocking - let jsdom handle most of it
    if (tagName === 'input') {
      element.click = element.click || vi.fn();
    }

    if (tagName === 'canvas') {
      // Mock canvas context with comprehensive 2D methods
      element.getContext = vi.fn((contextType) => {
        if (contextType === '2d') {
          return {
            // Drawing rectangles
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            strokeRect: vi.fn(),

            // Drawing paths
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            stroke: vi.fn(),
            fill: vi.fn(),
            clip: vi.fn(),

            // Drawing text
            fillText: vi.fn(),
            strokeText: vi.fn(),
            measureText: vi.fn(() => ({ width: 0, height: 12 })),

            // Drawing images
            drawImage: vi.fn(),

            // Pixel manipulation
            getImageData: vi.fn(() => ({
              data: new Uint8ClampedArray(4),
              width: 1,
              height: 1
            })),
            putImageData: vi.fn(),
            createImageData: vi.fn(() => ({
              data: new Uint8ClampedArray(4),
              width: 1,
              height: 1
            })),

            // Transformations
            setTransform: vi.fn(),
            resetTransform: vi.fn(),
            transform: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),

            // Compositing
            save: vi.fn(),
            restore: vi.fn(),

            // Styles
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            lineCap: 'butt',
            lineJoin: 'miter',
            miterLimit: 10,
            font: '10px sans-serif',
            textAlign: 'start',
            textBaseline: 'alphabetic',
            globalAlpha: 1,
            globalCompositeOperation: 'source-over'
          };
        }
        return null;
      });

      // Mock canvas dimensions
      Object.defineProperty(element, 'width', {
        get: function() { return this._width || 300; },
        set: function(value) { this._width = value; },
        configurable: true
      });

      Object.defineProperty(element, 'height', {
        get: function() { return this._height || 150; },
        set: function(value) { this._height = value; },
        configurable: true
      });
    }

    return element;
  });

  // Ensure RTL can properly mount components to document.body
  Object.defineProperty(document.body, 'appendChild', {
    value: function(child) {
      return Document.prototype.appendChild.call(this, child);
    },
    writable: true,
    configurable: true
  });

  // Fix jsdom body connection for RTL
  beforeEach(() => {
    // Ensure document.body is properly connected
    if (!document.body.isConnected) {
      document.documentElement.appendChild(document.body);
    }
  });

  // Mock IntersectionObserver for component tests
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));

  // Mock ResizeObserver for responsive component tests
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));

  // Mock performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    navigation: {
      type: 'navigate'
    },
    timing: {
      navigationStart: Date.now(),
      loadEventEnd: Date.now()
    }
  };

  // Mock localStorage and sessionStorage
  const createStorage = () => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
      key: vi.fn((index) => Object.keys(store)[index] || null),
      get length() { return Object.keys(store).length; }
    };
  };

  Object.defineProperty(window, 'localStorage', {
    value: createStorage(),
    configurable: true
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: createStorage(),
    configurable: true
  });
  // Mock webkitSpeechRecognition with proper constructor behavior
  function MockSpeechRecognition() {
    // Use regular function instead of class for proper constructor behavior
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'en-US';
    this.maxAlternatives = 1;
    this.serviceURI = '';
    this.grammars = null;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onresult = null;
    this.onnomatch = null;
    this.onsoundstart = null;
    this.onsoundend = null;
    this.onspeechstart = null;
    this.onspeechend = null;
    this.onaudiostart = null;
    this.onaudioend = null;

    this.start = vi.fn(() => {
      if (this.onstart) this.onstart();
    });
    this.stop = vi.fn(() => {
      if (this.onend) this.onend();
    });
    this.abort = vi.fn();
    this.addEventListener = vi.fn();
    this.removeEventListener = vi.fn();

    // Add support for triggering mock events
    this.triggerResult = (transcript, isFinal = true) => {
      if (this.onresult) {
        this.onresult({
          results: [[{ transcript, isFinal }]],
          resultIndex: 0
        });
      }
    };

    this.triggerError = (error) => {
      if (this.onerror) {
        this.onerror({ error });
      }
    };
  }

  // Set up constructor properties properly
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    writable: true,
    configurable: true,
    value: MockSpeechRecognition
  });

  Object.defineProperty(window, 'SpeechRecognition', {
    writable: true,
    configurable: true,
    value: MockSpeechRecognition
  });
  // Mock HTMLCanvasElement with comprehensive 2D context
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: vi.fn().mockImplementation((contextType) => {
      if (contextType === '2d') {
        return {
          // Drawing rectangles
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          strokeRect: vi.fn(),

          // Drawing paths
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          arc: vi.fn(),
          arcTo: vi.fn(),
          quadraticCurveTo: vi.fn(),
          bezierCurveTo: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn(),

          // Transformations
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
          transform: vi.fn(),
          setTransform: vi.fn(),
          resetTransform: vi.fn(),

          // Image data
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1
          })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            width: 1,
            height: 1
          })),

          // Drawing images
          drawImage: vi.fn(),

          // State
          save: vi.fn(),
          restore: vi.fn(),

          // Text
          fillText: vi.fn(),
          strokeText: vi.fn(),
          measureText: vi.fn(() => ({
            width: 0,
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 0,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0
          })),

          // Styles
          fillStyle: '#000000',
          strokeStyle: '#000000',
          lineWidth: 1,
          lineCap: 'butt',
          lineJoin: 'miter',
          miterLimit: 10,
          font: '10px sans-serif',
          textAlign: 'start',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
          globalCompositeOperation: 'source-over',

          // Gradients and patterns
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn()
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn()
          })),
          createPattern: vi.fn()
        };
      }
      return null;
    })
  });

  // Mock canvas dimensions
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
    writable: true,
    value: 300
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
    writable: true,
    value: 150
  });
}

// These mocks are safe for both environments
// Mock URL.createObjectURL with proper cleanup
Object.defineProperty(global.URL, 'createObjectURL', {
  value: vi.fn(() => 'data:application/json;base64,e30='),
  configurable: true,
  writable: true
});

Object.defineProperty(global.URL, 'revokeObjectURL', {
  value: vi.fn(),
  configurable: true,
  writable: true
});

// Mock FileReader for import/export tests
global.FileReader = vi.fn(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  onabort: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null,
  result: null,
  error: null,
  readyState: 0,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2
}));

// Mock Blob for file operations
global.Blob = vi.fn((content, options) => ({
  size: content ? (Array.isArray(content) ? content.join('').length : content.length) : 0,
  type: options?.type || 'text/plain',
  arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
  text: vi.fn(() => Promise.resolve('')),
  stream: vi.fn()
}));

// Mock File constructor
global.File = vi.fn((content, name, options) => ({
  ...new global.Blob(content, options),
  name: name || 'test-file.txt',
  lastModified: Date.now(),
  webkitRelativePath: ''
}));