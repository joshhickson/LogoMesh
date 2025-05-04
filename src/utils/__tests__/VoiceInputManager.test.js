
import { VoiceInputManager } from '../VoiceInputManager';

describe('VoiceInputManager', () => {
  let mockRecognition;
  
  beforeEach(() => {
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
});
