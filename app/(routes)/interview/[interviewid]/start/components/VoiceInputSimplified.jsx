import React, { useState } from "react";
import { MicIcon, MicOffIcon, SendIcon, Type, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceInputSimplified = ({
  currentTranscript,
  isRecording,
  onStartRecording,
  onStopRecording,
  onSubmit,
  onAskAI,
  isAILoading = false,
}) => {
  const [inputMode, setInputMode] = useState("voice"); // "voice" or "text" or "askAI"
  const [textAnswer, setTextAnswer] = useState("");
  const [aiQuery, setAiQuery] = useState("");

  const handleSubmit = () => {
    if (inputMode === "askAI") {
      if (aiQuery.trim()) {
        onAskAI(aiQuery.trim());
        setAiQuery("");
        setInputMode("voice"); // Switch back to default mode
      }
    } else {
      const answer = inputMode === "voice" ? currentTranscript : textAnswer;
      if (answer.trim()) {
        onSubmit(answer);
        if (inputMode === "text") {
          setTextAnswer("");
        }
      }
    }
  };

  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    if (mode === "text") {
      setTextAnswer("");
    } else if (mode === "askAI") {
      setAiQuery("");
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
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === "voice"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MicIcon className="w-4 h-4" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => handleModeSwitch("text")}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === "text"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Type</span>
            </button>
            <button
              onClick={() => handleModeSwitch("askAI")}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === "askAI"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* Voice Input Mode */}
        {inputMode === "voice" && (
          <div className="space-y-3">
            {/* Current Transcript */}
            <div className="min-h-16 p-3 bg-gray-50 rounded-lg border">
              <div className="text-sm text-gray-800">
                {currentTranscript ||
                  "Click and hold the microphone to record your answer"}
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center justify-between">
              <Button
                onMouseDown={onStartRecording}
                onMouseUp={onStopRecording}
                onTouchStart={onStartRecording}
                onTouchEnd={onStopRecording}
                variant={isRecording ? "destructive" : "default"}
                className={`transition-all ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isRecording ? (
                  <MicOffIcon className="w-4 h-4 mr-2" />
                ) : (
                  <MicIcon className="w-4 h-4 mr-2" />
                )}
                {isRecording ? "Recording" : "Hold to Record"}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!currentTranscript.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                Submit Answer
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

        {/* Ask AI Mode */}
        {inputMode === "askAI" && (
          <div className="space-y-3">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Ask AI for Help
                </span>
              </div>
              <p className="text-xs text-purple-600">
                Need clarification about the current question? Ask the AI for
                guidance!
              </p>
            </div>

            <div>
              <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask your question here... (e.g., 'Can you explain this concept?' or 'What should I focus on?')"
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isAILoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Brain className="w-3 h-3 mr-1" />
                {isAILoading
                  ? "Getting AI response..."
                  : "Ask for clarification"}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setInputMode("voice")}
                  variant="outline"
                  size="sm"
                  disabled={isAILoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!aiQuery.trim() || isAILoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAILoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-3 h-3 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInputSimplified;
