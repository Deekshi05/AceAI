import React from "react";
import { WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";

const WebcamPanel = ({
  webcamOn,
  setWebcamOn,
  interviewData,
  currentQuestionIndex,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col h-full">
      <div className="mb-3 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Video</h2>
        <p className="text-gray-600 text-xs">
          Monitor yourself during the interview
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {webcamOn ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1">
              <Webcam
                onUserMedia={() => setWebcamOn(true)}
                onUserMediaError={() => setWebcamOn(false)}
                className="w-full h-full object-cover rounded-lg border-2 border-gray-200 shadow-md"
              />
            </div>
            <div className="mt-3 text-center flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => setWebcamOn(false)}
                className="px-4 py-2 text-sm"
              >
                Turn Off Camera
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3 w-full h-full justify-center">
            <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 w-full flex-1 flex items-center justify-center max-h-48">
              <WebcamIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div className="text-center space-y-2 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900">
                Camera Off
              </h3>
              <p className="text-gray-600 text-xs">
                Enable camera for video recording
              </p>
            </div>
            <Button
              onClick={() => setWebcamOn(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <WebcamIcon className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          </div>
        )}
      </div>

      {/* Interview Progress */}
      {interviewData && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Questions</span>
              <span className="font-medium">
                {currentQuestionIndex + 1}/
                {interviewData.interviewQuestions?.length || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / (interviewData.interviewQuestions?.length || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              {Math.round(
                ((currentQuestionIndex + 1) /
                  (interviewData.interviewQuestions?.length || 1)) *
                  100
              )}
              % Complete
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamPanel;
