import React from "react";
import { UserIcon } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

const ChatMessage = ({ message, isSpeaking, onSpeak, onStopSpeaking }) => {
  if (message.type === "question") {
    return (
      <div className="w-full max-w-4xl">
        <WaveformVisualizer
          text={message.content}
          isSpeaking={isSpeaking}
          onSpeak={onSpeak}
          onStopSpeaking={onStopSpeaking}
          showControls={true}
        />
      </div>
    );
  }

  if (message.type === "answer") {
    return (
      <div className="flex items-start max-w-3xl">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg mr-3 relative">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <p className="leading-relaxed">{message.content}</p>
          <div className="flex items-center mt-2 text-green-100">
            <UserIcon className="w-4 h-4 mr-1" />
            <span className="text-xs">Your Answer</span>
          </div>
        </div>
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-200">
          <UserIcon className="w-4 h-4 text-green-600" />
        </div>
      </div>
    );
  }

  if (message.type === "system") {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
          <div className="flex items-center justify-center mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-blue-700 font-medium text-sm">
              {message.content}
            </span>
            <div className="w-2 h-2 bg-blue-400 rounded-full ml-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage;
