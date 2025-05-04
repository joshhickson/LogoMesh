
import { VoiceInputManager } from '../VoiceInputManager';

describe('VoiceInputManager', () => {
  let mockRecognition;
  let onTranscriptUpdate;
  let onError;
  
  beforeEach(() => {
    onTranscriptUpdate = jest.fn();
    onError = jest.fn();
    
    mockRecognition = {
      start: jest.fn(),
      stop: jest.fn(),
      continuous: false,
      interimResults: false,
      onresult: null,
      onerror: null
    };
    
    window.webkitSpeechRecognition = jest.fn(() => mockRecognition);
  });

  test('initializes with correct configuration', () => {
    const onTranscript = jest.fn();
    const onError = jest.fn();
    
    const manager = new VoiceInputManager(onTranscript, onError);
    
    expect(manager.isListening).toBe(false);
    expect(mockRecognition.continuous).toBe(true);
    expect(mockRecognition.interimResults).toBe(true);
  });

  test('handles start/stop listening correctly', () => {
    const manager = new VoiceInputManager(() => {}, () => {});
    
    manager.startListening();
    expect(mockRecognition.start).toHaveBeenCalled();
    expect(manager.isListening).toBe(true);
    
    manager.stopListening();
    expect(mockRecognition.stop).toHaveBeenCalled();
    expect(manager.isListening).toBe(false);
  });

  test('handles speech recognition results', () => {
    const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    const mockResults = [
      [{ isFinal: true, [0]: { transcript: 'Hello world.' } }]
    ];
    
    mockRecognition.onresult({ resultIndex: 0, results: mockResults });
    
    expect(onTranscriptUpdate).toHaveBeenCalledWith('Hello world.', true, true);
  });

  test('handles speech recognition errors', () => {
    const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    
    mockRecognition.onerror({ error: 'network' });
    
    expect(onError).toHaveBeenCalledWith('network');
  });

  test('checks browser support correctly', () => {
    const manager = new VoiceInputManager(onTranscriptUpdate, onError);
    expect(manager.isSupported()).toBe(true);
    
    delete window.webkitSpeechRecognition;
    expect(manager.isSupported()).toBe(false);
  });
});
