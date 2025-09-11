"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { FileText, Brain, MessageSquare, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeedbackDisplay = ({ interviewId, isOpen, onClose }) => {
  const convex = useConvex();
  const [feedbackData, setFeedbackData] = useState(null);
  const [aiInteractions, setAiInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && interviewId) {
      fetchFeedbackData();
    }
  }, [isOpen, interviewId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Get interview data with user responses and feedback
      const interview = await convex.query(api.interview.getInterviewById, {
        interviewId: interviewId,
      });

      // Get AI interactions
      const interactions = await convex.query(api.interview.getAIInteractions, {
        interviewId: interviewId,
      });

      setFeedbackData(interview);
      setAiInteractions(interactions);
    } catch (error) {
      console.error("Error fetching feedback data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return (
      new Date(timestamp).toLocaleDateString() +
      " " +
      new Date(timestamp).toLocaleTimeString()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Interview Feedback
              </h2>
              <p className="text-sm text-gray-600">
                Review your performance and AI interactions
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading feedback data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interview Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Interview Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Job Title:
                    </span>
                    <p className="text-gray-600">
                      {feedbackData?.jobTitle || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Questions Answered:
                    </span>
                    <p className="text-gray-600">
                      {feedbackData?.userResponses?.length || 0} /{" "}
                      {feedbackData?.interviewQuestions?.length || 0}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-600 capitalize">
                      {feedbackData?.status || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      AI Interactions:
                    </span>
                    <p className="text-gray-600">{aiInteractions.length}</p>
                  </div>
                </div>
              </div>

              {/* Question Responses and Feedback */}
              {feedbackData?.userResponses?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Question Responses & Feedback
                  </h3>
                  <div className="space-y-4">
                    {feedbackData.userResponses.map((response, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              Question {response.questionIndex + 1}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(response.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                            {response.question}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h5 className="font-medium text-gray-900 mb-1">
                            Your Answer:
                          </h5>
                          <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">
                            {response.userAnswer}
                          </p>
                        </div>

                        {response.feedback && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-1 flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              AI Feedback:
                            </h5>
                            <p className="text-gray-700 text-sm bg-green-50 p-3 rounded border-l-4 border-green-400">
                              {response.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Interactions */}
              {aiInteractions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Interactions
                  </h3>
                  <div className="space-y-4">
                    {aiInteractions.map((interaction, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-900 capitalize">
                              {interaction.type}
                            </span>
                            {interaction.questionIndex !== undefined && (
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Question {interaction.questionIndex + 1}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatTimestamp(interaction.timestamp)}
                          </span>
                        </div>

                        {interaction.userQuery && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-700 mb-1">
                              Your Question:
                            </h5>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {interaction.userQuery}
                            </p>
                          </div>
                        )}

                        <div>
                          <h5 className="font-medium text-purple-700 mb-1">
                            AI Response:
                          </h5>
                          <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                            {interaction.aiResponse}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!feedbackData?.userResponses?.length &&
                !aiInteractions.length && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Feedback Available
                    </h3>
                    <p className="text-gray-600">
                      Complete the interview to see your feedback and AI
                      interactions here.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
