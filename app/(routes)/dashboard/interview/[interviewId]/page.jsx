"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

function InterviewDetails() {
  const { interviewId } = useParams();
  const router = useRouter();
  const convex = useConvex();
  const deleteInterview = useMutation(api.interview.deleteInterview);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    if (interviewId) {
      fetchInterviewDetails();
    }
  }, [interviewId]);

  const fetchInterviewDetails = async () => {
    try {
      const data = await convex.query(api.interview.getInterviewById, {
        interviewId: interviewId,
      });
      setInterview(data);
    } catch (error) {
      console.error("Error fetching interview details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInterviewStatus = () => {
    // If interview has responses for all questions, it's completed
    const totalQuestions = interview.interviewQuestions?.length || 0;
    const answeredQuestions = interview.userResponses?.length || 0;

    if (totalQuestions > 0 && answeredQuestions >= totalQuestions) {
      return "completed";
    }

    // If interview has some responses but not all, it's in-progress
    if (answeredQuestions > 0) {
      return "in-progress";
    }

    // If no responses yet, it's scheduled
    return "scheduled";
  };

  const actualStatus = getInterviewStatus();

  const getCurrentResponse = () => {
    if (!interview?.userResponses) return null;
    return interview.userResponses.find(
      (response) => response.questionIndex === selectedQuestionIndex
    );
  };

  const handleDeleteInterview = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this interview session? This action cannot be undone."
      )
    ) {
      try {
        await deleteInterview({
          interviewId: interviewId,
        });
        toast.success("Interview session deleted successfully");
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deleting interview:", error);
        toast.error("Failed to delete interview session");
      }
    }
  };

  const getFeedbackIcon = (feedback) => {
    if (!feedback) return null;

    if (
      feedback.toLowerCase().includes("excellent") ||
      feedback.toLowerCase().includes("great")
    ) {
      return <Star className="w-4 h-4 text-yellow-500" />;
    } else if (
      feedback.toLowerCase().includes("good") ||
      feedback.toLowerCase().includes("satisfactory")
    ) {
      return <ThumbsUp className="w-4 h-4 text-green-500" />;
    } else if (
      feedback.toLowerCase().includes("needs improvement") ||
      feedback.toLowerCase().includes("poor")
    ) {
      return <ThumbsDown className="w-4 h-4 text-red-500" />;
    }
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The interview you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentResponse = getCurrentResponse();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <Button
              onClick={handleDeleteInterview}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Session
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {interview.jobTitle || "Interview Session"}
                </h1>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(actualStatus)}`}
                >
                  {actualStatus === "scheduled" && "Not Started"}
                  {actualStatus === "in-progress" && "In Progress"}
                  {actualStatus === "completed" && "Completed"}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 flex items-center justify-end mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(interview.startTime)}
                </p>
                {interview.endTime && interview.startTime && (
                  <p className="text-sm text-gray-500 flex items-center justify-end">
                    <Clock className="w-4 h-4 mr-1" />
                    Duration:{" "}
                    {Math.round(
                      (interview.endTime - interview.startTime) / 60000
                    )}{" "}
                    minutes
                  </p>
                )}
              </div>
            </div>

            {interview.jobDescription && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Job Description
                </h3>
                <p className="text-gray-600 text-sm">
                  {interview.jobDescription}
                </p>
              </div>
            )}

            <div className="flex space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                <span>
                  {interview.interviewQuestions?.length || 0} Questions
                </span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>{interview.userResponses?.length || 0} Answered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Questions
              </h2>
              <div className="space-y-2">
                {interview.interviewQuestions?.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedQuestionIndex === index
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        Question {index + 1}
                      </span>
                      {interview.userResponses?.find(
                        (r) => r.questionIndex === index
                      ) && (
                        <div className="flex items-center">
                          {getFeedbackIcon(
                            interview.userResponses.find(
                              (r) => r.questionIndex === index
                            )?.feedback
                          )}
                          <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {question.question}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {interview.interviewQuestions?.[selectedQuestionIndex] && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Question {selectedQuestionIndex + 1}
                      </h2>
                      {currentResponse && (
                        <span className="text-sm text-green-600 font-medium">
                          Answered
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {
                        interview.interviewQuestions[selectedQuestionIndex]
                          .question
                      }
                    </p>
                  </div>

                  {currentResponse ? (
                    <div className="space-y-6">
                      {/* User Answer */}
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-3">
                          Your Answer
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-gray-700">
                            {currentResponse.userAnswer}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Answered on {formatDate(currentResponse.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Expected Answer */}
                      {currentResponse.expectedAnswer && (
                        <div>
                          <h3 className="text-md font-semibold text-gray-900 mb-3">
                            Expected Answer
                          </h3>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                              {currentResponse.expectedAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {currentResponse.feedback && (
                        <div>
                          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                            {getFeedbackIcon(currentResponse.feedback)}
                            <span className="ml-2">AI Feedback</span>
                          </h3>
                          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                            <p className="text-gray-700">
                              {currentResponse.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        This question hasn't been answered yet.
                      </p>
                      {actualStatus !== "completed" && (
                        <Button
                          onClick={() =>
                            router.push(`/interview/${interviewId}/start`)
                          }
                          className="mt-4"
                        >
                          {actualStatus === "scheduled"
                            ? "Start Interview"
                            : "Continue Interview"}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewDetails;
