import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function InterviewBlocked({ interview, reason, onGoBack }) {
  const router = useRouter();

  const getReasonMessage = () => {
    switch (reason) {
      case "timed-out":
        return {
          title: "Interview Session Timed Out",
          message:
            "This interview session has been automatically terminated due to inactivity for more than 1 hour. In real interviews, sessions cannot be resumed once they have timed out.",
          icon: <Clock className="w-16 h-16 text-red-500" />,
        };
      case "no-resume":
        return {
          title: "Interview Cannot Be Resumed",
          message:
            "This interview session was started but not completed within the time limit. Like real interviews, once a session is started, it cannot be paused and resumed later.",
          icon: <AlertTriangle className="w-16 h-16 text-yellow-500" />,
        };
      default:
        return {
          title: "Interview Session Unavailable",
          message: "This interview session is no longer available.",
          icon: <AlertTriangle className="w-16 h-16 text-gray-500" />,
        };
    }
  };

  const { title, message, icon } = getReasonMessage();

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">{icon}</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>

        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

        {interview && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              Interview Details:
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Position:</span>{" "}
                {interview.jobTitle || "Interview Session"}
              </p>
              {interview.startTime && (
                <p>
                  <span className="font-medium">Started:</span>{" "}
                  {formatDate(interview.startTime)}
                </p>
              )}
              {interview.endTime && (
                <p>
                  <span className="font-medium">Ended:</span>{" "}
                  {formatDate(interview.endTime)}
                </p>
              )}
              {interview.timeoutReason && (
                <p>
                  <span className="font-medium">Reason:</span>{" "}
                  {interview.timeoutReason}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>

          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full"
          >
            Start New Interview
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> To simulate real interview conditions, we
            recommend completing interviews in one session without breaks.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InterviewBlocked;
