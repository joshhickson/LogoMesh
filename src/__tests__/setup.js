// Test setup with global mocks
import { vi } from 'vitest';
import { mockApiService } from '../services/mockApiService';

// Mock apiService - provide both default export and named apiService export
vi.mock('../services/apiService', () => {
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
vi.mock('../components/Canvas', () => ({
  default: () => <div data-testid="canvas-mock">Canvas Mock</div>
}));

// Mock Cytoscape and related libraries
vi.mock('cytoscape', () => {
  const mockCytoscape = vi.fn(() => ({
    elements: vi.fn().mockReturnThis(),
    layout: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    fit: vi.fn().mockReturnThis(),
    center: vi.fn().mockReturnThis(),
    zoom: vi.fn().mockReturnThis(),
    pan: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      data: vi.fn(),
      position: vi.fn()
    })),
    edges: vi.fn(() => ({
      forEach: vi.fn(),
      data: vi.fn()
    }))
  }));

  // Add the use method to register extensions
  mockCytoscape.use = vi.fn();

  return {
    default: mockCytoscape
  };
});

// Mock Cytoscape extensions
vi.mock('cytoscape-fcose', () => ({
  default: vi.fn(),
  __esModule: true
}));

vi.mock('cytoscape-cose-bilkent', () => ({
  default: vi.fn(),
  __esModule: true
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