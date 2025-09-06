import React from "react";
import { MicIcon, MicOffIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const VoiceInput = ({
  currentTranscript,
  isRecording,
  onStartRecording,
  onStopRecording,
  onSubmit,
}) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3 min-h-20 max-h-32 overflow-y-auto border">
            <p className="text-gray-700 whitespace-pre-wrap">
              {currentTranscript ||
                "Your answer will appear here as you speak..."}
            </p>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {!isRecording ? (
            <Button
              onClick={onStartRecording}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              <MicIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onStopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
            >
              <MicOffIcon className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={onSubmit}
            disabled={!currentTranscript.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {isRecording && (
        <div className="flex items-center justify-center mt-2 text-red-600 text-sm">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
          Recording... Speak your answer
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
