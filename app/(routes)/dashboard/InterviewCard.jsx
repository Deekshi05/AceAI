import React from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Eye,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function InterviewCard({
  interview,
  onInterviewDeleted,
  isSelected,
  onToggleSelect,
}) {
  const router = useRouter();
  const deleteInterview = useMutation(api.interview.deleteInterview);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
      case "timed-out":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInterviewStatus = () => {
    // Check if interview is timed out
    if (interview.isTimedOut || interview.status === "timed-out") {
      return "timed-out";
    }

    // If interview has responses for all questions, it's completed
    const totalQuestions = interview.interviewQuestions?.length || 0;
    const answeredQuestions = interview.userResponses?.length || 0;

    if (totalQuestions > 0 && answeredQuestions >= totalQuestions) {
      return "completed";
    }

    // Check if interview has been started but timed out due to inactivity
    if (interview.status === "in-progress" && interview.startTime) {
      const now = Date.now();
      const timeSinceStart = now - interview.startTime;
      const oneHour = 60 * 60 * 1000;

      if (timeSinceStart > oneHour) {
        return "timed-out";
      }
    }

    // If interview has some responses but not all, it's in-progress
    if (answeredQuestions > 0) {
      return "in-progress";
    }

    // If no responses yet, it's scheduled
    return "scheduled";
  };

  const actualStatus = getInterviewStatus();

  const handleViewDetails = () => {
    router.push(`/dashboard/interview/${interview._id}`);
  };

  const handleContinueInterview = () => {
    router.push(`/interview/${interview._id}/start`);
  };

  const handleDeleteInterview = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this interview session? This action cannot be undone."
      )
    ) {
      try {
        await deleteInterview({
          interviewId: interview._id,
        });
        toast.success("Interview session deleted successfully");
        if (onInterviewDeleted) {
          onInterviewDeleted();
        }
      } catch (error) {
        console.error("Error deleting interview:", error);
        toast.error("Failed to delete interview session");
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {interview.jobTitle || "Interview Session"}
            </h3>
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(actualStatus)}`}
            >
              {actualStatus === "scheduled" && "Not Started"}
              {actualStatus === "in-progress" && "In Progress"}
              {actualStatus === "completed" && "Completed"}
              {actualStatus === "timed-out" && "Timed Out"}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(interview.startTime)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteInterview}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {interview.jobDescription && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {interview.jobDescription}
        </p>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            <span>{interview.interviewQuestions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>{interview.userResponses?.length || 0} Answered</span>
          </div>
          {interview.endTime && interview.startTime && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>
                {Math.round((interview.endTime - interview.startTime) / 60000)}{" "}
                min
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={handleViewDetails}
          variant="outline"
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        {actualStatus === "scheduled" && (
          <Button onClick={handleContinueInterview} className="flex-1">
            Start Interview
          </Button>
        )}
        {actualStatus === "in-progress" && (
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            Cannot Resume
          </Button>
        )}
        {actualStatus === "completed" && (
          <Button
            onClick={handleViewDetails}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Results
          </Button>
        )}
        {actualStatus === "timed-out" && (
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
          >
            Timed Out
          </Button>
        )}
      </div>
    </div>
  );
}

export default InterviewCard;
