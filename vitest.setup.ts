
import { vi } from 'vitest';

// Make vi globally available as jest for compatibility
global.jest = vi;

// Mock browser APIs that aren't available in test environment
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition,
});

// Mock alert
window.alert = vi.fn();
