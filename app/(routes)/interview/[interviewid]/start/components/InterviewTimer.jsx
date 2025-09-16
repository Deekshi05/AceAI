import React, { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, StopCircle } from "lucide-react";

function InterviewTimer({ startTime, onTimeout, isActive = true }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [finalWarningShown, setFinalWarningShown] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Memoize the timeout handler to prevent unnecessary re-renders
  const handleTimeout = useCallback(() => {
    if (onTimeout) {
      onTimeout();
    }
  }, [onTimeout]);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // in seconds
      setElapsedTime(elapsed);

      // Show warning at 50 minutes (3000 seconds)
      if (elapsed >= 3000 && !warningShown) {
        setWarningShown(true);
        const remainingMinutes = Math.ceil((3600 - elapsed) / 60);
        alert(
          `⚠️ Warning: You have ${remainingMinutes} minutes remaining before the interview automatically times out!`
        );
      }

      // Show final warning at 55 minutes (3300 seconds)
      if (elapsed >= 3300 && !finalWarningShown) {
        setFinalWarningShown(true);
        setIsBlinking(true);
        const remainingMinutes = Math.ceil((3600 - elapsed) / 60);
        alert(
          `🚨 Final Warning: Only ${remainingMinutes} minutes left! The interview will automatically end when the timer reaches 1 hour.`
        );
      }

      // Auto timeout at 60 minutes (3600 seconds)
      if (elapsed >= 3600) {
        clearInterval(interval);
        handleTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive, warningShown, finalWarningShown, handleTimeout]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (elapsedTime >= 3000) return "text-red-600"; // Last 10 minutes
    if (elapsedTime >= 2400) return "text-yellow-600"; // Last 20 minutes
    return "text-blue-600";
  };

  const getProgressPercentage = () => {
    return Math.min((elapsedTime / 3600) * 100, 100);
  };

  if (!isActive || !startTime) return null;

  return (
    <div
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all duration-500 ${
        elapsedTime >= 3300
          ? "border-red-300 bg-red-50"
          : elapsedTime >= 3000
            ? "border-yellow-300 bg-yellow-50"
            : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock
            className={`w-4 h-4 mr-2 ${
              elapsedTime >= 3300 ? "text-red-600" : "text-gray-600"
            } ${isBlinking ? "animate-pulse" : ""}`}
          />
          <span className="text-sm font-medium text-gray-700">
            Interview Timer
          </span>
        </div>
        {elapsedTime >= 3300 ? (
          <StopCircle className="w-4 h-4 text-red-500 animate-pulse" />
        ) : elapsedTime >= 3000 ? (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        ) : null}
      </div>

      <div
        className={`text-2xl font-bold mb-2 transition-colors duration-300 ${getTimeColor()} ${
          isBlinking ? "animate-pulse" : ""
        }`}
      >
        {formatTime(elapsedTime)}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${
            elapsedTime >= 3300
              ? "bg-red-600 animate-pulse"
              : elapsedTime >= 3000
                ? "bg-red-500"
                : elapsedTime >= 2400
                  ? "bg-yellow-500"
                  : "bg-blue-500"
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      <div className="text-xs text-center">
        {elapsedTime >= 3300 ? (
          <div className="space-y-1">
            <span className="text-red-700 font-bold block animate-pulse">
              🚨 {Math.floor((3600 - elapsedTime) / 60)} minutes remaining!
            </span>
            <span className="text-red-600 text-xs">
              Interview will auto-stop at 1 hour
            </span>
          </div>
        ) : elapsedTime >= 3000 ? (
          <span className="text-yellow-700 font-medium">
            ⚠️ {Math.floor((3600 - elapsedTime) / 60)} minutes remaining
          </span>
        ) : (
          <span className="text-gray-500">
            Time limit: 60 minutes ({Math.floor((3600 - elapsedTime) / 60)} mins
            left)
          </span>
        )}
      </div>
    </div>
  );
}

export default InterviewTimer;
