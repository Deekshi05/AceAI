import React, { useState } from "react";
import { MicIcon, MicOffIcon, SendIcon, Type, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceInput = ({
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
    if (mode === "voice" && isRecording) {
      onStopRecording();
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      {/* Input Mode Toggle - Compact */}
      <div className="flex justify-center mb-2">
        <div className="bg-gray-100 rounded-lg p-0.5 flex">
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

      {/* Voice Input Mode - Compact */}
      {inputMode === "voice" && (
        <div className="space-y-2">
          <div className="bg-gray-50 rounded-lg p-2 min-h-16 max-h-20 overflow-y-auto border">
            <p className="text-gray-700 whitespace-pre-wrap text-xs leading-relaxed">
              {currentTranscript || "Click mic and speak..."}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isRecording ? (
                <Button
                  onClick={onStartRecording}
                  className="bg-red-500 hover:bg-red-600 text-white flex items-center space-x-1 text-xs px-2 py-1 h-8"
                >
                  <MicIcon className="w-3 h-3" />
                  <span>Record</span>
                </Button>
              ) : (
                <Button
                  onClick={onStopRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-1 text-xs px-2 py-1 h-8"
                >
                  <MicOffIcon className="w-3 h-3" />
                  <span>Stop</span>
                </Button>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!currentTranscript.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 text-xs px-2 py-1 h-8"
            >
              <SendIcon className="w-3 h-3" />
              <span>Submit</span>
            </Button>
          </div>

          {isRecording && (
            <div className="flex items-center justify-center text-red-600 text-xs">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse mr-1"></div>
              Recording...
            </div>
          )}
        </div>
      )}

      {/* Text Input Mode - Compact */}
      {inputMode === "text" && (
        <div className="space-y-2">
          <div>
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-16 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <Keyboard className="w-3 h-3 mr-1" />
              {textAnswer.length} chars
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!textAnswer.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 text-xs px-2 py-1 h-8"
            >
              <SendIcon className="w-3 h-3" />
              <span>Submit</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
