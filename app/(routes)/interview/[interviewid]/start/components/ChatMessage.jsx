import React from "react";
import {
  UserIcon,
  BotIcon,
  Clock,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

const ChatMessage = ({ message, isSpeaking, onSpeak, onStopSpeaking }) => {
  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (message.type === "question") {
    return (
      <div className="flex items-start space-x-3 mb-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <BotIcon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              AI Interviewer
            </span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">{formatTime()}</span>
          </div>

          {/* Message Bubble */}
          <div className="bg-white rounded-lg rounded-tl-sm border border-gray-200 shadow-sm p-3">
            <p className="text-gray-800 text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "answer") {
    return (
      <div className="flex items-start space-x-3 mb-3 justify-end">
        {/* Message Content */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-end space-x-2 mb-1">
            <span className="text-xs text-gray-400">{formatTime()}</span>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">You</span>
          </div>

          {/* Message Bubble */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg rounded-tr-sm text-white shadow-sm p-3">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>

        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "feedback") {
    return (
      <div className="flex items-start space-x-3 mb-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-amber-700">
              AI Feedback
            </span>
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
            <span className="text-xs text-gray-400">{formatTime()}</span>
          </div>

          {/* Message Bubble */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg rounded-tl-sm border border-amber-200 shadow-sm p-3">
            <p className="text-amber-800 text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "hint") {
    return (
      <div className="flex items-start space-x-3 mb-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-green-700">AI Hint</span>
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400">{formatTime()}</span>
          </div>

          {/* Message Bubble */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg rounded-tl-sm border border-green-200 shadow-sm p-3">
            <p className="text-green-800 text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === "system") {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-gray-600 font-medium text-xs">
              {message.content}
            </span>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatMessage;
