// Test setup with global mocks
import { vi } from 'vitest';

// Mock apiService
vi.mock('./services/apiService', () => ({
  apiService: {
    getThoughts: vi.fn().mockResolvedValue([]),
    saveThought: vi.fn().mockResolvedValue({ id: 'test' }),
    deleteThought: vi.fn().mockResolvedValue(true),
  }
}));

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