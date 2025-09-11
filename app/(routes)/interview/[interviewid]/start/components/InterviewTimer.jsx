import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

function InterviewTimer({ startTime, onTimeout, isActive = true }) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // in seconds
      setElapsedTime(elapsed);

      // Show warning at 50 minutes (3000 seconds)
      if (elapsed >= 3000 && !warningShown) {
        setWarningShown(true);
        alert(
          "Warning: You have 10 minutes remaining before the interview times out!"
        );
      }

      // Auto timeout at 60 minutes (3600 seconds)
      if (elapsed >= 3600) {
        onTimeout();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive, warningShown, onTimeout]);

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
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Interview Timer
          </span>
        </div>
        {elapsedTime >= 3000 && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
      </div>

      <div className={`text-2xl font-bold ${getTimeColor()} mb-2`}>
        {formatTime(elapsedTime)}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            elapsedTime >= 3000
              ? "bg-red-500"
              : elapsedTime >= 2400
                ? "bg-yellow-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        {elapsedTime >= 3000 ? (
          <span className="text-red-600 font-medium">
            {Math.floor((3600 - elapsedTime) / 60)} minutes remaining
          </span>
        ) : (
          <span>Time limit: 60 minutes</span>
        )}
      </div>
    </div>
  );
}

export default InterviewTimer;
