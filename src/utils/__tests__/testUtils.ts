import { vi, Mock } from 'vitest';
import { Thought, Segment } from '@contracts/entities';

type MockedFunction<T extends (...args: any[]) => any> = Mock<Parameters<T>, ReturnType<T>>;

export const createMockSpeechRecognition = () => {
  const mockRecognition = {
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    onresult: undefined,
    onerror: undefined,
    onend: undefined,
    onstart: undefined,
    onspeechstart: undefined,
    onspeechend: undefined,
    onnomatch: undefined,
    onaudiostart: undefined,
    onaudioend: undefined,
    onsoundstart: undefined,
    onsoundend: undefined,
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    maxAlternatives: 1,
    serviceURI: '',
    grammars: null as any,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  const mockSpeechRecognition = vi.fn(() => mockRecognition);

  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: mockSpeechRecognition,
    configurable: true,
    writable: true
  });

  Object.defineProperty(window, 'SpeechRecognition', {
    value: mockSpeechRecognition,
    configurable: true,
    writable: true
  });

  return mockRecognition;
};

export type MockFileReader = FileReader & {
    readAsText: MockedFunction<FileReader['readAsText']>;
    readAsDataURL: MockedFunction<FileReader['readAsDataURL']>;
    readAsArrayBuffer: MockedFunction<FileReader['readAsArrayBuffer']>;
};

export const createMockFileReader = (): MockFileReader => {
  const mockFileReader: Partial<MockFileReader> = {
    readAsText: vi.fn(),
    readAsDataURL: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    abort: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
    readyState: 0,
  };

  global.FileReader = vi.fn(() => mockFileReader as FileReader) as any;
  return mockFileReader as MockFileReader;
};

export const createMockBlob = (): void => {
  global.Blob = vi.fn((content: any[], options: any) => ({
    size: content ? content.join('').length : 0,
    type: options?.type || 'text/plain',
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    text: vi.fn().mockResolvedValue(content.join('')),
    stream: vi.fn(),
    slice: vi.fn(),
  })) as any;
};

export const createMockFile = (): void => {
  global.File = vi.fn((content: any[], name: string, options: any) => ({
    ...new global.Blob(content, options),
    name: name || 'test-file.txt',
    lastModified: Date.now(),
  })) as any;
};

export const mockDOMElements = () => {
  const mockAnchor = document.createElement('a');
  vi.spyOn(mockAnchor, 'click').mockImplementation(() => {});

  const mockInput = document.createElement('input');

  const mockCanvas = document.createElement('canvas');
  vi.spyOn(mockCanvas, 'getContext').mockReturnValue({
    fillRect: vi.fn(),
  } as any);

  document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'a') return mockAnchor;
    if (tagName === 'input') return mockInput;
    if (tagName === 'canvas') return mockCanvas;
    return document.createElement(tagName);
  });

  document.body.appendChild = vi.fn((node: Node) => node) as any;

  return { mockAnchor, mockInput, mockCanvas };
};

export const mockURLMethods = (): void => {
  global.URL.createObjectURL = vi.fn(() => 'data:application/json;base64,e30=');
  global.URL.revokeObjectURL = vi.fn();
};

export const createMockThought = (overrides: Partial<Thought> = {}): Thought => ({
  id: 'test-id',
  title: 'Test Thought',
  description: 'Test description',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  segments: [],
  tags: [],
  color: '#10b981',
  position: { x: 0, y: 0 },
  ...overrides,
});

export const createMockSegment = (overrides: Partial<Segment> = {}): Segment => ({
  segment_id: 'test-segment-id',
  thought_bubble_id: 'test-id',
  title: 'Test Segment',
  content: 'Test content',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockExportData = (thoughts: Thought[] = []) => ({
  export_metadata: {
    version: '0.5.0',
    exported_at: new Date().toISOString(),
    author: 'Test User',
    tool: 'ThoughtWeb'
  },
  thoughts: thoughts.length > 0 ? thoughts : [createMockThought()]
});

export const triggerFileInputChange = (element: HTMLInputElement, files: File[]): void => {
  Object.defineProperty(element, 'files', {
    value: files,
    writable: false,
  });

  element.dispatchEvent(new Event('change'));
};

export const simulateFileReaderLoad = (fileReader: MockFileReader, content: string): void => {
  (fileReader as any).result = content;
  if (fileReader.onload) {
    fileReader.onload({ target: fileReader } as any as ProgressEvent<FileReader>);
  }
};

export const cleanupMocks = (): void => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};