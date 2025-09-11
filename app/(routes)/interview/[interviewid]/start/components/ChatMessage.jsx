import React from "react";
import { UserIcon, BotIcon, Brain } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

const ChatMessage = ({ message, isSpeaking, onSpeak, onStopSpeaking }) => {
  if (message.type === "question") {
    return (
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <BotIcon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-gray-800 text-sm leading-relaxed mb-2">
              {message.content}
            </p>
            <WaveformVisualizer
              text={message.content}
              isSpeaking={isSpeaking}
              onSpeak={onSpeak}
              onStopSpeaking={onStopSpeaking}
              showControls={false}
            />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "answer") {
    return (
      <div className="flex items-start space-x-3 mb-4 justify-end">
        <div className="flex-1 max-w-2xl">
          <div className="bg-blue-500 rounded-lg text-white p-3">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "ai-query") {
    return (
      <div className="mb-4">
        {/* User Query */}
        <div className="flex items-start space-x-3 mb-2 justify-end">
          <div className="flex-1 max-w-2xl">
            <div className="bg-purple-500 rounded-lg text-white p-3">
              <p className="text-sm leading-relaxed">{message.userQuery}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
              <p className="text-purple-800 text-sm leading-relaxed">
                {message.aiResponse}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-gray-100 rounded-full px-3 py-1">
          <span className="text-gray-600 text-xs">{message.content}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage;
