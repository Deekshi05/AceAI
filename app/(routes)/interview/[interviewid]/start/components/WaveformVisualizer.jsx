"use client";
import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

const WaveformVisualizer = ({
  text,
  isSpeaking,
  onSpeak,
  onStopSpeaking,
  showControls = true,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [showText, setShowText] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);

  // Generate random waveform data for visualization
  const generateWaveformData = (isActive = false) => {
    const dataArray = new Array(16).fill(0); // Reduced for small waveform
    if (isActive) {
      for (let i = 0; i < dataArray.length; i++) {
        // Create vertical movement only - each bar oscillates independently
        const timeOffset = Date.now() * 0.008; // Control animation speed
        const barOffset = i * 0.8; // Different phase for each bar
        const baseHeight = Math.sin(timeOffset + barOffset) * 0.4 + 0.6; // Oscillate between 0.2 and 1.0
        const randomVariation = Math.random() * 0.3 + 0.8; // Add some randomness
        dataArray[i] = baseHeight * randomVariation * 255;
      }
    } else {
      for (let i = 0; i < dataArray.length; i++) {
        // Subtle vertical movement when not speaking - much slower
        const timeOffset = Date.now() * 0.002;
        const barOffset = i * 0.4;
        const baseHeight = Math.sin(timeOffset + barOffset) * 0.1 + 0.3; // Smaller range
        dataArray[i] = baseHeight * 80; // Lower amplitude when idle
      }
    }
    return dataArray;
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with dark background
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, width, height);

    // Generate waveform data
    const dataArray = generateWaveformData(isSpeaking);
    const barWidth = (width / dataArray.length) * 0.6; // 60% width for bars
    const spacing = width / dataArray.length; // Total space per bar including spacing

    // Draw bars - each bar stays in its fixed horizontal position
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      const x = i * spacing + (spacing - barWidth) / 2; // Fixed horizontal position
      const y = (height - barHeight) / 2; // Center the bars vertically

      // Create gradient for each bar based on activity
      const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);

      if (isSpeaking) {
        // Active state - blue gradient
        const intensity = dataArray[i] / 255;
        if (intensity > 0.7) {
          gradient.addColorStop(0, "#1e40af");
          gradient.addColorStop(1, "#60a5fa");
        } else {
          gradient.addColorStop(0, "#1e3a8a");
          gradient.addColorStop(1, "#3b82f6");
        }
      } else {
        // Idle state - subtle gray gradient
        gradient.addColorStop(0, "#374151");
        gradient.addColorStop(1, "#6b7280");
      }

      ctx.fillStyle = gradient;

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 6);
      ctx.fill();
    }
  };

  useEffect(() => {
    const animate = () => {
      drawWaveform();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      onSpeak(text);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
      <div className="flex items-center justify-between">
        {/* Speaker with Small Waveform */}
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full transition-all duration-300 cursor-pointer ${
              isSpeaking
                ? "bg-blue-500 text-white shadow-lg animate-pulse"
                : "bg-gray-100 text-blue-500 hover:bg-blue-50 border border-gray-200"
            }`}
            onClick={handleSpeakToggle}
            title={isSpeaking ? "Stop speaking" : "Play question"}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>

          {/* Small Waveform */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={200}
              height={40}
              className="w-24 h-5 rounded bg-gray-800"
            />
          </div>

          <div className="text-xs text-gray-600">
            {isSpeaking ? "Playing..." : "Question ready"}
          </div>
        </div>

        {/* View Question Toggle */}
        {showControls && (
          <button
            onClick={() => setShowText(!showText)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-gray-800 border border-gray-200"
            title={showText ? "Hide question" : "View question"}
          >
            {showText ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Question Text (toggleable) */}
      {showText && (
        <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div className="flex items-start space-x-2">
            <div className="p-1 bg-blue-100 rounded">
              <Volume2 className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
