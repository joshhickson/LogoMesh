import { vi } from 'vitest';

// Test utilities for consistent mocking across test files
export const createMockSpeechRecognition = () => {
  const mockRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    onresult: null,
    onerror: null,
    onend: null,
    onstart: null,
    onspeechstart: null,
    onspeechend: null,
    onnomatch: null,
    onaudiostart: null,
    onaudioend: null,
    onsoundstart: null,
    onsoundend: null,
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    maxAlternatives: 1,
    serviceURI: '',
    grammars: null
  };

  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: vi.fn(() => mockRecognition),
    configurable: true,
    writable: true
  });

  Object.defineProperty(window, 'SpeechRecognition', {
    value: vi.fn(() => mockRecognition),
    configurable: true,
    writable: true
  });

  return mockRecognition;
};

export const createMockFileReader = () => {
  const mockFileReader = {
    readAsText: vi.fn(),
    readAsDataURL: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    readAsBinaryString: vi.fn(),
    abort: vi.fn(),
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
  };

  global.FileReader = vi.fn(() => mockFileReader);
  return mockFileReader;
};

export const createMockBlob = () => {
  global.Blob = vi.fn((content, options) => ({
    size: content ? (Array.isArray(content) ? content.join('').length : content.length) : 0,
    type: options?.type || 'text/plain',
    arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
    text: vi.fn(() => Promise.resolve('')),
    stream: vi.fn(),
    slice: vi.fn()
  }));
};

export const createMockFile = () => {
  global.File = vi.fn((content, name, options) => ({
    ...new global.Blob(content, options),
    name: name || 'test-file.txt',
    lastModified: Date.now(),
    lastModifiedDate: new Date(),
    webkitRelativePath: '',
    size: content ? content.length : 0,
    type: options?.type || 'text/plain'
  }));
};

export const mockDOMElements = () => {
  const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
    remove: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    target: '_self',
    rel: ''
  };

  const mockInput = {
    type: 'file',
    accept: '',
    multiple: false,
    onchange: null,
    click: vi.fn(),
    files: [],
    value: '',
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  };

  const mockCanvas = {
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 0, height: 12 })),
      drawImage: vi.fn(),
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
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      transform: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over'
    })),
    width: 300,
    height: 150,
    toDataURL: vi.fn(() => 'data:image/png;base64,'),
    toBlob: vi.fn((callback) => callback && callback(new Blob()))
  };

  document.createElement = vi.fn((tagName) => {
    if (tagName === 'a') return mockAnchor;
    if (tagName === 'input') return mockInput;
    if (tagName === 'canvas') return mockCanvas;
    return { 
      click: vi.fn(), 
      remove: vi.fn(),
      setAttribute: vi.fn(),
      getAttribute: vi.fn()
    };
  });

  document.body.appendChild = vi.fn((element) => element);

  return { mockAnchor, mockInput, mockCanvas };
};

export const mockURLMethods = () => {
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
};

// Helper to create mock thought data
export const createMockThought = (overrides = {}) => ({
  thought_bubble_id: 'test-id',
  title: 'Test Thought',
  description: 'Test description',
  created_at: new Date().toISOString(),
  segments: [],
  tags: [],
  color: '#10b981',
  position: { x: 0, y: 0 },
  ...overrides
});

// Helper to create mock segment data
export const createMockSegment = (overrides = {}) => ({
  segment_id: 'test-segment-id',
  title: 'Test Segment',
  content: 'Test content',
  fields: {},
  embedding_vector: [],
  ...overrides
});

// Helper to create mock export data
export const createMockExportData = (thoughts = []) => ({
  export_metadata: {
    version: '0.5.0',
    exported_at: new Date().toISOString(),
    author: 'Test User',
    tool: 'ThoughtWeb'
  },
  thoughts: thoughts.length > 0 ? thoughts : [createMockThought()]
});

// Helper to trigger file input change events
export const triggerFileInputChange = (element, files) => {
  Object.defineProperty(element, 'files', {
    value: files,
    writable: false
  });

  if (element.onchange) {
    element.onchange({ target: { files } });
  }
};

// Helper to simulate FileReader operations
export const simulateFileReaderLoad = (fileReader, content) => {
  fileReader.result = content;
  if (fileReader.onload) {
    fileReader.onload({ target: { result: content } });
  }
};

// Helper to clean up mocks between tests
export const cleanupMocks = () => {
  vi.clearAllMocks();

  // Reset any global state
  if (global.URL.createObjectURL) {
    global.URL.createObjectURL.mockReset();
  }
  if (global.URL.revokeObjectURL) {
    global.URL.revokeObjectURL.mockReset();
  }
};