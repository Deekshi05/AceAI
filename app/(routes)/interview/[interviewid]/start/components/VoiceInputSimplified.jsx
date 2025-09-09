import React, { useState } from "react";
import { MicIcon, MicOffIcon, SendIcon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceInputSimplified = ({
  currentTranscript,
  isRecording,
  onStartRecording,
  onStopRecording,
  onSubmit,
}) => {
  const [inputMode, setInputMode] = useState("voice"); // "voice" or "text"
  const [textAnswer, setTextAnswer] = useState("");

  const handleSubmit = () => {
    const answer = inputMode === "voice" ? currentTranscript : textAnswer;
    if (answer.trim()) {
      onSubmit(answer);
      if (inputMode === "text") {
        setTextAnswer("");
      }
    }
  };

  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    if (mode === "text") {
      setTextAnswer("");
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="space-y-3">
        {/* Mode Switcher */}
        <div className="flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => handleModeSwitch("voice")}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                inputMode === "voice"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MicIcon className="w-3 h-3" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => handleModeSwitch("text")}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Type</span>
            </button>
          </div>
        </div>

        {/* Voice Input Mode */}
        {inputMode === "voice" && (
          <div className="space-y-3">
            {/* Current Transcript Display */}
            <div className="min-h-16 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">
                {isRecording ? "Recording..." : "Voice input"}
              </div>
              <div className="text-sm text-gray-800">
                {currentTranscript ||
                  "Click the microphone to start recording your answer..."}
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onMouseDown={onStartRecording}
                  onMouseUp={onStopRecording}
                  onTouchStart={onStartRecording}
                  onTouchEnd={onStopRecording}
                  variant={isRecording ? "destructive" : "default"}
                  size="sm"
                  className={`transition-all duration-200 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isRecording ? (
                    <MicOffIcon className="w-4 h-4" />
                  ) : (
                    <MicIcon className="w-4 h-4" />
                  )}
                  <span className="ml-1">
                    {isRecording ? "Recording" : "Hold to Record"}
                  </span>
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!currentTranscript.trim()}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
              >
                <SendIcon className="w-3 h-3" />
                <span>Submit Answer</span>
              </Button>
            </div>
          </div>
        )}

        {/* Text Input Mode */}
        {inputMode === "text" && (
          <div className="space-y-2">
            <div>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Type className="w-3 h-3 mr-1" />
                Type your response
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!textAnswer.trim()}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
              >
                <SendIcon className="w-3 h-3" />
                <span>Submit Answer</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInputSimplified;
