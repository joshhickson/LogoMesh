import { describe, test, expect, beforeEach, vi } from 'vitest';
import VoiceInputManager from '../VoiceInputManager';

describe('VoiceInputManager', () => {
  let mockRecognition;
  let onTranscriptUpdate;
  let onError;

  beforeEach(() => {
    // Mock window.webkitSpeechRecognition
    mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      onresult: null,
      onerror: null,
      continuous: false,
      interimResults: false,
    };

    // Define webkitSpeechRecognition as a configurable property
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: vi.fn(() => mockRecognition),
      configurable: true,
      writable: true
    });

    onTranscriptUpdate = vi.fn();
    onError = vi.fn();
  });

  test('initializes with correct configuration', () => {
    const onTranscript = vi.fn();
    const onError = vi.fn();

    // TODO: This variable was flagged as unused by ESLint.
    // const manager = new VoiceInputManager(onTranscript, onError);
    const localManager = new VoiceInputManager(onTranscript, onError);

    expect(localManager.isListening).toBe(false);
    expect(mockRecognition.continuous).toBe(true);
    expect(mockRecognition.interimResults).toBe(true);
  });

  test('handles start/stop listening correctly', () => {
    // TODO: This variable was flagged as unused by ESLint.
    // const manager = new VoiceInputManager(
    const localManager = new VoiceInputManager(
      () => { /* TODO: Implement test case */ },
      () => { /* TODO: Implement test case */ }
    );

    localManager.startListening();
    expect(mockRecognition.start).toHaveBeenCalled();
    expect(localManager.isListening).toBe(true);

    localManager.stopListening();
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect(localManager.isListening).toBe(false);
  });

  test('handles speech recognition results', () => {
    // TODO: This variable was flagged as unused by ESLint.
    // const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    new VoiceInputManager(onTranscriptUpdate, onError);

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
    // TODO: This variable was flagged as unused by ESLint.
    // const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    new VoiceInputManager(onTranscriptUpdate, onError);

    mockRecognition.onerror({ error: 'network' });

    expect(onError).toHaveBeenCalledWith('network');
  });

  test('checks browser support correctly', () => {
    const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    expect(manager.isSupported()).toBe(true);

    // Test when not supported
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      value: undefined,
      configurable: true,
      writable: true
    });

    const unsupportedManager = new VoiceInputManager(onTranscriptUpdate, onError);
    expect(unsupportedManager.isSupported()).toBe(false);
  });
});