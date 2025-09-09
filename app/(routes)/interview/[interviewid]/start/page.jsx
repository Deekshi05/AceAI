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
import VoiceInputSimplified from "./components/VoiceInputSimplified";
import WebcamPanel from "./components/WebcamPanel";
import WaveformVisualizer from "./components/WaveformVisualizer";

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

  // Remove auto-question adding - questions will be added when answered
  // useEffect(() => {
  //   if (interviewData?.interviewQuestions && conversation.length === 0) {
  //     addQuestionToChat(0);
  //   }
  // }, [interviewData]);

  // Auto-speak removed - questions are hidden by default
  // useEffect(() => {
  //   const lastMessage = conversation[conversation.length - 1];
  //   if (lastMessage && lastMessage.type === "question" && !isSpeaking) {
  //     setTimeout(() => {
  //       handleSpeakQuestion(lastMessage.content);
  //     }, 500);
  //   }
  // }, [conversation]);

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

  const handleSubmitAnswer = (answer) => {
    if (submitAnswer(answer || currentTranscript, currentQuestionIndex)) {
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

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Side Container - Current Question + Webcam */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-4">
            {/* Current Question Controls */}
            {interviewData?.interviewQuestions &&
              currentQuestionIndex <
                interviewData.interviewQuestions.length && (
                <div className="border border-gray-200 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <BotIcon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900">
                          Question {currentQuestionIndex + 1} of{" "}
                          {interviewData.interviewQuestions.length}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Question Controls */}
                  <WaveformVisualizer
                    text={
                      interviewData.interviewQuestions[currentQuestionIndex]
                        ?.question || ""
                    }
                    isSpeaking={isSpeaking}
                    onSpeak={handleSpeakQuestion}
                    onStopSpeaking={handleStopSpeaking}
                    showControls={true}
                  />
                </div>
              )}

            {/* Webcam Panel - Takes remaining space */}
            <div className="flex-1">
              <WebcamPanel
                webcamOn={webcamOn}
                setWebcamOn={setWebcamOn}
                interviewData={interviewData}
                currentQuestionIndex={currentQuestionIndex}
              />
            </div>
          </div>

          {/* Chat Interface - Right Side - Takes remaining space */}
          <div className="flex-1 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg flex flex-col border border-gray-200 max-w-4xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <BotIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      AI Interview Chat
                    </h2>
                    <div className="text-sm text-gray-500 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Active session
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    Progress:{" "}
                    {conversation.filter((msg) => msg.type === "answer").length}{" "}
                    / {interviewData?.interviewQuestions?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Questions answered
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages - Increased size for better visibility */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0"
              style={{ minHeight: "60vh" }}
            >
              {/* Chat History - Previous Q&A */}
              {conversation.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isSpeaking={isSpeaking}
                  onSpeak={handleSpeakQuestion}
                  onStopSpeaking={handleStopSpeaking}
                />
              ))}

              {/* Welcome message if no conversation yet and no questions */}
              {conversation.length === 0 &&
                !interviewData?.interviewQuestions && (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-center text-gray-500">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BotIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-medium mb-1">
                        Loading Interview...
                      </h3>
                      <div className="flex justify-center space-x-1 mt-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

              <div ref={chatEndRef} />
            </div>

            {/* Voice Input */}
            {currentQuestionIndex <
              (interviewData?.interviewQuestions?.length || 0) && (
              <div className="flex-shrink-0">
                <VoiceInputSimplified
                  currentTranscript={currentTranscript}
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onSubmit={handleSubmitAnswer}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
