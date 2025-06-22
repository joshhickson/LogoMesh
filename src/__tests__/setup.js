// Test setup with global mocks
import { vi } from 'vitest';

// Mock apiService - provide both default export and named apiService export
vi.mock('../services/apiService', () => {
  const mockApiService = {
    fetchThoughts: vi.fn().mockResolvedValue([]),
    getThoughtById: vi.fn().mockResolvedValue({ id: 'test', content: 'test thought' }),
    createThoughtApi: vi.fn().mockResolvedValue({ id: 'test', content: 'new thought' }),
    updateThoughtApi: vi.fn().mockResolvedValue({ id: 'test', content: 'updated thought' }),
    deleteThoughtApi: vi.fn().mockResolvedValue(true),
    createSegmentApi: vi.fn().mockResolvedValue({ id: 'segment-test' }),
    updateSegmentApi: vi.fn().mockResolvedValue({ id: 'segment-test' }),
    deleteSegmentApi: vi.fn().mockResolvedValue(true),
    exportDataApi: vi.fn().mockResolvedValue({ data: 'exported' }),
    importDataApi: vi.fn().mockResolvedValue({ success: true }),
    triggerBackupApi: vi.fn().mockResolvedValue({ success: true }),
    getLLMStatus: vi.fn().mockResolvedValue({ status: 'running' }),
    callLLMApi: vi.fn().mockResolvedValue({ response: 'test response' }),
    analyzeSegment: vi.fn().mockResolvedValue({ analysis: 'test analysis' }),
  };

  return {
    // Default export
    default: mockApiService,
    // Named export
    apiService: mockApiService,
    // Individual function exports
    ...mockApiService
  };
});

// Mock Canvas component
vi.mock('./components/Canvas', () => ({
  default: () => <div data-testid="canvas-mock">Canvas Mock</div>
}));

// Mock Cytoscape
vi.mock('cytoscape', () => ({
  default: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    layout: vi.fn(() => ({ run: vi.fn() })),
    fit: vi.fn(),
    on: vi.fn(),
  }))
}));

// Mock webkitSpeechRecognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    continuous: true,
    interimResults: true,
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
});