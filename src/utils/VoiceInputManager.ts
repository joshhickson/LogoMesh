type TranscriptUpdateHandler = (transcript: string, isFinal: boolean, isNewSegment?: boolean) => void;
type ErrorHandler = (error: string) => void;

export class VoiceInputManager {
  private recognition: SpeechRecognition | null;
  private isListening: boolean;
  private onTranscriptUpdate: TranscriptUpdateHandler;
  private onError: ErrorHandler;

  constructor(onTranscriptUpdate: TranscriptUpdateHandler, onError: ErrorHandler) {
    this.recognition = null;
    this.isListening = false;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onError = onError;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            if (transcript.match(/[.!?]|\.\.\.|$/) && transcript.length > 30) {
              finalTranscript += transcript;
              this.onTranscriptUpdate(finalTranscript, true, true);
            } else {
              finalTranscript += transcript;
              this.onTranscriptUpdate(finalTranscript, true, false);
            }
          } else {
            interimTranscript += transcript;
            this.onTranscriptUpdate(interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.onError(event.error);
        if (
          event.error === 'network' ||
          event.error === 'service-not-allowed'
        ) {
          setTimeout(() => {
            if (this.isListening) {
              this.startListening();
            }
          }, 1000);
        }
      };
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window;
  }
}

export default VoiceInputManager;