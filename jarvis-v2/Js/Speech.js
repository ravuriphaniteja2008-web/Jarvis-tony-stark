export const SpeechManager = {
  recognition: null,
  synth: window.speechSynthesis,
  isListening: false,
  isContinuousMode: false,
  onWakeWordDetected: null,
  activeCommandCaptured: false,

  initRecognition(onResult, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullText = (finalTranscript || interimTranscript).toLowerCase().trim();

      if (this.isContinuousMode && !this.activeCommandCaptured) {
        if (fullText.includes('jarvis')) {
          this.activeCommandCaptured = true;
          const command = fullText.split('jarvis')[1]?.trim();
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected(command || '');
          }
        }
      } else if (onResult) {
        onResult({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim()
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isContinuousMode && this.isListening) {
        try { this.recognition.start(); } catch (e) {}
      } else {
        this.isListening = false;
      }
    };

    return true;
  },

  startListening(onResult, onError) {
    this.isContinuousMode = false;
    if (!this.recognition) this.initRecognition(onResult, onError);
    if (this.isListening) return;

    try {
      this.recognition.continuous = false;
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  },

  startContinuousListening(onWakeWordCallback, onError) {
    this.isContinuousMode = true;
    this.activeCommandCaptured = false;
    this.onWakeWordDetected = onWakeWordCallback;

    if (!this.recognition) this.initRecognition(null, onError);
    if (this.isListening) return;

    try {
      this.recognition.continuous = true;
      this.recognition.start();
      this.isListening = true;
    } catch (err) {
      console.error("Failed to start continuous listening:", err);
    }
  },

  stopListening() {
    this.isContinuousMode = false;
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  },

  speak(text, onStart, onEnd) {
    if (!this.synth) { if (onEnd) onEnd(); return; }

    this.synth.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('UK') || v.name.includes('British') || v.name.includes('Google'))) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => { if (onStart) onStart(); };
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };

    this.synth.speak(utterance);
  }
};
