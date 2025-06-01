export class VoiceInputManager {
  constructor(onTranscriptUpdate, onError) {
    this.recognition = null;
    this.isListening = false;
    this.onTranscriptUpdate = onTranscriptUpdate;
    this.onError = onError;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            // Split on sentence endings or long pauses
            if (transcript.match(/[.!?]|\.\.\.|$/) && transcript.length > 30) {
              finalTranscript += transcript;
              this.onTranscriptUpdate(finalTranscript, true, true); // Third param indicates new segment
            } else {
              finalTranscript += transcript;
              this.onTranscriptUpdate(finalTranscript, true, false);
            }
          } else {
            interimTranscript += event.results[i][0].transcript;
            this.onTranscriptUpdate(interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event) => {
        this.onError(event.error);
        if (
          event.error === 'network' ||
          event.error === 'service-not-allowed'
        ) {
          setTimeout(() => {
            if (this.isListening) {
              this.startListening(); // Attempt reconnection
            }
          }, 1000);
        }
      };
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported() {
    return 'webkitSpeechRecognition' in window;
  }
}

export { VoiceInputManager };
export default VoiceInputManager;