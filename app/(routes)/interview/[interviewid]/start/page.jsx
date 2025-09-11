"use client";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
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
import FeedbackDisplay from "./components/FeedbackDisplay";
import InterviewTimer from "./components/InterviewTimer";
import InterviewBlocked from "./components/InterviewBlocked";
import { Button } from "@/components/ui/button";

function StartInterview() {
  const { interviewid } = useParams();
  const convex = useConvex();
  const updateInterviewStatus = useMutation(
    api.interview.updateInterviewStatus
  );
  const updateLastActivity = useMutation(api.interview.updateLastActivity);
  const checkInterviewTimeout = useMutation(
    api.interview.checkInterviewTimeout
  );
  const [interviewData, setInterviewData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState(null);
  const [webcamOn, setWebcamOn] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const chatEndRef = useRef(null);

  const { addQuestionToChat, submitAnswer, submitAIQuery } = useInterviewLogic(
    interviewData,
    setConversation,
    setCurrentQuestionIndex
  );

  useEffect(() => {
    GetInterviewQuestions();
    initializeSpeechRecognition();
  }, [interviewid]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.stop();
      }
      stopSpeaking();
    };
  }, [recognition]);

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
    try {
      // First check if interview is timed out
      const timeoutCheck = await checkInterviewTimeout({
        interviewId: interviewid,
      });

      if (timeoutCheck.isTimedOut || timeoutCheck.status === "timed-out") {
        setInterviewData(timeoutCheck);
        setIsBlocked(true);
        setBlockReason("timed-out");
        return;
      }

      const res = await convex.query(api.interview.getInterviewById, {
        interviewId: interviewid,
      });
      setInterviewData(res);

      // Check if interview was started but needs to be blocked
      if (res && res.status === "in-progress" && res.startTime) {
        const now = Date.now();
        const timeSinceStart = now - res.startTime;
        const oneHour = 60 * 60 * 1000;

        // If more than 1 hour has passed since start, block the interview
        if (timeSinceStart > oneHour) {
          await updateInterviewStatus({
            interviewId: interviewid,
            status: "timed-out",
          });
          setIsBlocked(true);
          setBlockReason("timed-out");
          return;
        }
      }

      // Mark interview as in-progress when user accesses the interview
      if (res && (res.status === "scheduled" || !res.status)) {
        try {
          await updateInterviewStatus({
            interviewId: interviewid,
            status: "in-progress",
          });
          // Update last activity time
          await updateLastActivity({
            interviewId: interviewid,
          });
        } catch (error) {
          console.error("Error updating interview status:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching interview:", error);
    }
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
      trackActivity(); // Track activity when user starts recording
    }
  };

  const handleStopRecording = () => {
    stopRecording(recognition);
    trackActivity(); // Track activity when user stops recording
  };

  const handleSubmitAnswer = async (answer) => {
    if (submitAnswer(answer || currentTranscript, currentQuestionIndex)) {
      setCurrentTranscript("");
      setIsRecording(false);

      // Update last activity time
      try {
        await updateLastActivity({
          interviewId: interviewid,
        });
      } catch (error) {
        console.error("Error updating last activity:", error);
      }

      // Check if all questions are answered and mark as completed
      const nextQuestionIndex = currentQuestionIndex + 1;
      const totalQuestions = interviewData?.interviewQuestions?.length || 0;

      if (nextQuestionIndex >= totalQuestions) {
        try {
          await updateInterviewStatus({
            interviewId: interviewid,
            status: "completed",
          });
          console.log("Interview marked as completed");
        } catch (error) {
          console.error("Error marking interview as completed:", error);
        }
      }
    }
  };

  const handleTimeout = async () => {
    try {
      await updateInterviewStatus({
        interviewId: interviewid,
        status: "timed-out",
      });
      setIsBlocked(true);
      setBlockReason("timed-out");
    } catch (error) {
      console.error("Error handling timeout:", error);
    }
  };

  const trackActivity = async () => {
    try {
      await updateLastActivity({
        interviewId: interviewid,
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  };

  const handleAIQuery = async (query) => {
    setIsAILoading(true);
    try {
      // Add user query to chat first
      setConversation((prev) => [
        ...prev,
        {
          type: "ai-query",
          userQuery: query,
          aiResponse: "AI is processing your query...",
          timestamp: new Date(),
          isLoading: true,
        },
      ]);

      const aiResponse = await submitAIQuery(query, currentQuestionIndex);

      // Update the last message with the actual AI response
      setConversation((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex] && updated[lastIndex].isLoading) {
          updated[lastIndex] = {
            type: "ai-query",
            userQuery: query,
            aiResponse: aiResponse,
            timestamp: new Date(),
          };
        }
        return updated;
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Update with error message
      setConversation((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex] && updated[lastIndex].isLoading) {
          updated[lastIndex] = {
            type: "ai-query",
            userQuery: query,
            aiResponse:
              "Sorry, there was an error getting AI response. Please try again.",
            timestamp: new Date(),
          };
        }
        return updated;
      });
    } finally {
      setIsAILoading(false);
    }
  };

  // Show blocked screen if interview is blocked
  if (isBlocked) {
    return <InterviewBlocked interview={interviewData} reason={blockReason} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-3xl text-gray-800 mb-3">
            AI Interview Session
          </h1>

          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <p className="text-gray-600 font-medium">
                Question {currentQuestionIndex + 1} of{" "}
                {interviewData?.interviewQuestions?.length || 0}
              </p>
            </div>

            {isSpeaking && (
              <div className="inline-flex items-center space-x-2 text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                <Volume2 className="w-4 h-4" />
                <span className="font-medium">AI is speaking</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left Side - Question, Timer, and Webcam */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-4">
            {/* Interview Timer */}
            <InterviewTimer
              startTime={interviewData?.startTime}
              onTimeout={handleTimeout}
              isActive={interviewData?.status === "in-progress"}
            />

            {/* Current Question */}
            {interviewData?.interviewQuestions &&
              currentQuestionIndex <
                interviewData.interviewQuestions.length && (
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Current Question
                  </h4>

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

            {/* Webcam */}
            <div className="flex-1">
              <WebcamPanel
                webcamOn={webcamOn}
                setWebcamOn={setWebcamOn}
                interviewData={interviewData}
                currentQuestionIndex={currentQuestionIndex}
              />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col border border-gray-200">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <BotIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Interview Chat
                    </h2>
                    <p className="text-sm text-gray-600">
                      Interactive AI Assistant
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-800">
                    {conversation.filter((msg) => msg.type === "answer").length}{" "}
                    / {interviewData?.interviewQuestions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Answered</div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ minHeight: "60vh" }}
            >
              {conversation.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isSpeaking={isSpeaking}
                  onSpeak={handleSpeakQuestion}
                  onStopSpeaking={handleStopSpeaking}
                />
              ))}

              {/* Empty state */}
              {conversation.length === 0 &&
                !interviewData?.interviewQuestions && (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-center text-gray-500">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BotIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700">
                        Loading Interview Questions
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Please wait while we prepare your interview
                      </p>
                    </div>
                  </div>
                )}

              <div ref={chatEndRef} />
            </div>

            {/* Voice Input */}
            {currentQuestionIndex <
              (interviewData?.interviewQuestions?.length || 0) && (
              <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <VoiceInputSimplified
                  currentTranscript={currentTranscript}
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                  onSubmit={handleSubmitAnswer}
                  onAskAI={handleAIQuery}
                  isAILoading={isAILoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Display Modal */}
      <FeedbackDisplay
        interviewId={interviewid}
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
}

export default StartInterview;
