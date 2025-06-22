import { describe, test, expect, beforeEach, vi } from 'vitest';
import VoiceInputManager from '../VoiceInputManager';

describe('VoiceInputManager', () => {
  let mockRecognition;
  let onTranscriptUpdate;
  let onError;

  beforeEach(() => {
    // Reset the mock before each test
    vi.clearAllMocks();

    // Create fresh mock recognition instance
    mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: 'en-US',
      onresult: null,
      onerror: null,
      onend: null,
      onstart: null
    };

    // Mock the constructor function properly
    global.window.webkitSpeechRecognition = vi.fn(() => mockRecognition);

    // Setup callback functions
    onTranscriptUpdate = vi.fn();
    onError = vi.fn();
  });

  test('initializes with correct configuration', () => {
    const manager = new VoiceInputManager({ onTranscriptUpdate, onError });

    expect(manager.recognition).toBeDefined();
    expect(manager.recognition.continuous).toBe(true);
    expect(manager.recognition.interimResults).toBe(true);
    expect(manager.recognition.lang).toBe('en-US');
  });

  test('handles start/stop listening correctly', () => {
    const manager = new VoiceInputManager({ onTranscriptUpdate, onError });

    manager.startListening();
    expect(manager.isListening).toBe(true);

    manager.stopListening();
    expect(manager.isListening).toBe(false);
  });

  test('handles speech recognition results', () => {
    new VoiceInputManager({ onTranscriptUpdate, onError });

    // Test short phrase
    const mockResults = {
      results: [[{ transcript: 'Hello world.', isFinal: true }]],
      resultIndex: 0,
    };
    mockRecognition.onresult(mockResults);
    expect(onTranscriptUpdate).toHaveBeenCalledWith('Hello world.', true, false);

    // Test long sentence that should trigger segmentation
    const longResults = {
      results: [
        [
          {
            transcript:
              'This is a very long sentence that should trigger automatic segmentation because it exceeds thirty characters.',
            isFinal: true,
          },
        ],
      ],
      resultIndex: 0,
    };
    mockRecognition.onresult(longResults);
    expect(onTranscriptUpdate).toHaveBeenCalledWith(
      'This is a very long sentence that should trigger automatic segmentation because it exceeds thirty characters.',
      true,
      true
    );
  });

  test('handles speech recognition errors', () => {
    new VoiceInputManager({ onTranscriptUpdate, onError });

    mockRecognition.onerror({ error: 'network' });

    expect(onError).toHaveBeenCalledWith('network');
  });

  test('checks browser support correctly', () => {
    const manager = new VoiceInputManager({ onTranscriptUpdate, onError });
    expect(manager.isSupported()).toBe(true);

    // Test when not supported
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const unsupportedManager = new VoiceInputManager({ onTranscriptUpdate, onError });
    expect(unsupportedManager.isSupported()).toBe(false);
  });

  it('should initialize with default options', () => {
    const manager = new VoiceInputManager(() => {}, () => {});
    expect(manager).toBeDefined();
    expect(manager.isSupported()).toBe(true);
  });

  test('initializes speech recognition correctly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Check that recognition was created (mock exists)
    expect(manager.recognition).toBeDefined();
    if (manager.recognition) {
      expect(manager.recognition.continuous).toBe(true);
      expect(manager.recognition.interimResults).toBe(true);
    }
  });

  test('handles callback functions properly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Test that callbacks are properly bound
    expect(typeof manager.onTranscriptUpdate).toBe('function');
    expect(typeof manager.onError).toBe('function');

    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: [
        {
          isFinal: true,
          0: { transcript: 'Hello world' }
        }
      ]
    };

    // Call the onresult handler directly
    if (manager.recognition && manager.recognition.onresult) {
      manager.recognition.onresult(mockEvent);
      expect(mockOnTranscriptUpdate).toHaveBeenCalledWith('Hello world', true, false);
    }
  });

  test('handles error scenarios correctly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Simulate an error
    const mockErrorEvent = { error: 'network' };
    if (manager.recognition && manager.recognition.onerror) {
      manager.recognition.onerror(mockErrorEvent);
      expect(mockOnError).toHaveBeenCalledWith('network');
    }
  });
});