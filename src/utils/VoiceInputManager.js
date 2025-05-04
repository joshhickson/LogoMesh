
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
            finalTranscript += event.results[i][0].transcript;
            this.onTranscriptUpdate(finalTranscript, true);
          } else {
            interimTranscript += event.results[i][0].transcript;
            this.onTranscriptUpdate(interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event) => {
        this.onError(event.error);
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
