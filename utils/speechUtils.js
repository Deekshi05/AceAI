// Speech Recognition Utility Functions

export const setupSpeechRecognition = (onResult, onError, onEnd) => {
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult(finalTranscript + interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (onError) {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    return recognition;
  }
  return null;
};

export const speakText = (text, onStart, onEnd, onError) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      const errorMessage =
        event.error || event.type || "Unknown speech synthesis error";
      console.error("Speech synthesis error:", errorMessage);
      if (onError) onError(errorMessage);
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
};

export const startRecording = (recognition) => {
  if (recognition) {
    try {
      recognition.start();
      return true;
    } catch (error) {
      console.error("Error starting recognition:", error);
      return false;
    }
  }
  return false;
};

export const stopRecording = (recognition) => {
  if (recognition) {
    try {
      recognition.stop();
      return true;
    } catch (error) {
      console.error("Error stopping recognition:", error);
      return false;
    }
  }
  return false;
};
