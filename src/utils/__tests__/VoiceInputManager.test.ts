import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import VoiceInputManager from '../VoiceInputManager';

describe('VoiceInputManager', () => {
  let mockRecognition: Partial<SpeechRecognition>;
  let onTranscriptUpdate: Mock<[string, boolean, boolean?], void>;
  let onError: Mock<[string], void>;

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
      onresult: undefined,
      onerror: undefined,
      onend: undefined,
      onstart: undefined
    };

    // Mock the constructor function properly
    (global.window as any).webkitSpeechRecognition = vi.fn().mockImplementation(() => mockRecognition);

    // Setup callback functions
    onTranscriptUpdate = vi.fn();
    onError = vi.fn();
  });

  test('initializes with correct configuration', () => {
    const localManager = new VoiceInputManager(onTranscriptUpdate, onError);

    expect((localManager as any).isListening).toBe(false);
    expect(mockRecognition.continuous).toBe(true);
    expect(mockRecognition.interimResults).toBe(true);
  });

  test('handles start/stop listening correctly', () => {
    const localManager = new VoiceInputManager(onTranscriptUpdate, onError);

    localManager.startListening();
    expect(mockRecognition.start).toHaveBeenCalled();
    expect((localManager as any).isListening).toBe(true);

    localManager.stopListening();
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect((localManager as any).isListening).toBe(false);
  });

  test('handles speech recognition results', () => {
    const localManager = new VoiceInputManager(onTranscriptUpdate, onError);
    (localManager as any).recognition = mockRecognition; // Ensure the manager uses our mock

    // Test short phrase
    const mockShortPhraseResults = {
      results: [ // SpeechRecognitionResultList
        { // SpeechRecognitionResult (event.results[0])
          isFinal: true,
          0: { transcript: 'Hello world.', confidence: 0.9 }
        }
      ],
      resultIndex: 0
    };
    if (mockRecognition.onresult) mockRecognition.onresult(mockShortPhraseResults as any as SpeechRecognitionEvent);
    expect(onTranscriptUpdate).toHaveBeenCalledWith('Hello world.', true, false);

    // Test long sentence that should trigger segmentation
    const mockLongSentenceResults = {
      results: [
        {
          isFinal: true,
          0: {
            transcript: 'This is a very long sentence that should trigger automatic segmentation because it exceeds thirty characters.',
            confidence: 0.9
          }
        }
      ],
      resultIndex: 0
    };
    if (mockRecognition.onresult) mockRecognition.onresult(mockLongSentenceResults as any as SpeechRecognitionEvent);
    expect(onTranscriptUpdate).toHaveBeenCalledWith(
      'This is a very long sentence that should trigger automatic segmentation because it exceeds thirty characters.',
      true,
      true // This part of the logic in VoiceInputManager might also need review for the > 30 condition
    );
  });

  test('handles speech recognition errors', () => {
    new VoiceInputManager(onTranscriptUpdate, onError);

    if (mockRecognition.onerror) mockRecognition.onerror({ error: 'network' } as any as SpeechRecognitionErrorEvent);

    expect(onError).toHaveBeenCalledWith('network');
  });

  test('checks browser support correctly', () => {
    const localManager = new VoiceInputManager(onTranscriptUpdate, onError);
    expect(localManager.isSupported()).toBe(true);

    // Test when not supported
    delete (global.window as any).webkitSpeechRecognition;

    const unsupportedManager = new VoiceInputManager(onTranscriptUpdate, onError);
    expect(unsupportedManager.isSupported()).toBe(false);
  });

  it('should initialize with default options', () => {

    const manager = new VoiceInputManager(() => { /* mock callback */ }, () => { /* mock callback */ });
    expect(manager).toBeDefined();
    expect(manager.isSupported()).toBe(true);
  });

  test('initializes speech recognition correctly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Check that recognition was created (mock exists)
    expect((manager as any).recognition).toBeDefined();
    if ((manager as any).recognition) {
      expect((manager as any).recognition.continuous).toBe(true);
      expect((manager as any).recognition.interimResults).toBe(true);
    }
  });

  test('handles callback functions properly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Test that callbacks are properly bound
    expect(typeof (manager as any).onTranscriptUpdate).toBe('function');
    expect(typeof (manager as any).onError).toBe('function');

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
    if ((manager as any).recognition && (manager as any).recognition.onresult) {
      (manager as any).recognition.onresult(mockEvent as any as SpeechRecognitionEvent);
      expect(mockOnTranscriptUpdate).toHaveBeenCalledWith('Hello world', true, false);
    }
  });

  test('handles error scenarios correctly', () => {
    const mockOnTranscriptUpdate = vi.fn();
    const mockOnError = vi.fn();

    const manager = new VoiceInputManager(mockOnTranscriptUpdate, mockOnError);

    // Simulate an error
    const mockErrorEvent = { error: 'network' };
    if ((manager as any).recognition && (manager as any).recognition.onerror) {
      (manager as any).recognition.onerror(mockErrorEvent as any as SpeechRecognitionErrorEvent);
      expect(mockOnError).toHaveBeenCalledWith('network');
    }
  });
});