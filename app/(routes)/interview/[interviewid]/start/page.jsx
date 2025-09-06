"use client";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useConvex } from "convex/react";
import { BotIcon, Volume2 } from "lucide-react";
import {
  setupSpeechRecognition,
  speakText,
  stopSpeaking,
  startRecording,
  stopRecording,
} from "@/utils/speechUtils";
import { useInterviewLogic } from "./hooks/useInterviewLogic";
import ChatMessage from "./components/ChatMessage";
import VoiceInput from "./components/VoiceInput";
import WebcamPanel from "./components/WebcamPanel";

function StartInterview() {
  const { interviewid } = useParams();
  const convex = useConvex();
  const [interviewData, setInterviewData] = useState(null);
  const [webcamOn, setWebcamOn] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);

  const { addQuestionToChat, submitAnswer } = useInterviewLogic(
    interviewData,
    setConversation,
    setCurrentQuestionIndex
  );

  useEffect(() => {
    GetInterviewQuestions();
    initializeSpeechRecognition();
  }, [interviewid]);

  useEffect(() => {
    if (interviewData?.interviewQuestions && conversation.length === 0) {
      addQuestionToChat(0);
    }
  }, [interviewData]);

  // Auto-speak new questions
  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && lastMessage.type === "question" && !isSpeaking) {
      // Small delay to ensure the UI is ready
      setTimeout(() => {
        handleSpeakQuestion(lastMessage.content);
      }, 500);
    }
  }, [conversation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const GetInterviewQuestions = async () => {
    const res = await convex.query(api.interview.getInterviewById, {
      interviewId: interviewid,
    });
    setInterviewData(res);
  };

  const initializeSpeechRecognition = () => {
    const recognition = setupSpeechRecognition(
      (transcript) => setCurrentTranscript(transcript),
      (error) => setIsRecording(false),
      () => setIsRecording(false)
    );
    setRecognition(recognition);
  };

  const handleSpeakQuestion = (text) => {
    speakText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleStartRecording = () => {
    setCurrentTranscript("");
    if (startRecording(recognition)) {
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    stopRecording(recognition);
  };

  const handleSubmitAnswer = () => {
    if (submitAnswer(currentTranscript, currentQuestionIndex)) {
      setCurrentTranscript("");
      setIsRecording(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <BotIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Interview Session
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-gray-600 font-medium">
              Question {currentQuestionIndex + 1} of{" "}
              {interviewData?.interviewQuestions?.length || 0}
            </p>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          {isSpeaking && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-blue-600">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">AI is speaking...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BotIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      AI Interviewer
                    </h2>
                    <p className="text-sm text-gray-500">
                      Interactive Interview Session
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {conversation.filter((msg) => msg.type === "answer").length}{" "}
                  answered
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "answer"
                      ? "justify-end"
                      : message.type === "question"
                        ? "justify-center"
                        : "justify-center"
                  }`}
                >
                  <ChatMessage
                    message={message}
                    isSpeaking={isSpeaking}
                    onSpeak={handleSpeakQuestion}
                    onStopSpeaking={handleStopSpeaking}
                  />
                </div>
              ))}

              {/* Welcome message if no conversation yet */}
              {conversation.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BotIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Interview Starting...
                    </h3>
                    <p className="text-sm">
                      Your AI interviewer will ask questions shortly
                    </p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Voice Input */}
            {currentQuestionIndex <
              (interviewData?.interviewQuestions?.length || 0) && (
              <VoiceInput
                currentTranscript={currentTranscript}
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onSubmit={handleSubmitAnswer}
              />
            )}
          </div>

          {/* Webcam Panel */}
          <WebcamPanel
            webcamOn={webcamOn}
            setWebcamOn={setWebcamOn}
            interviewData={interviewData}
            currentQuestionIndex={currentQuestionIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
