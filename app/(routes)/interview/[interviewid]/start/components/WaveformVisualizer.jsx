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
    const dataArray = new Array(32).fill(0); // Reduced for wider bars
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
    ctx.fillStyle = "#0f1419";
    ctx.fillRect(0, 0, width, height);

    // Generate waveform data
    const dataArray = generateWaveformData(isSpeaking);
    const barWidth = (width / dataArray.length) * 0.7; // 70% width for bars
    const spacing = width / dataArray.length; // Total space per bar including spacing

    // Draw bars - each bar stays in its fixed horizontal position
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.9;
      const x = i * spacing + (spacing - barWidth) / 2; // Fixed horizontal position
      const y = (height - barHeight) / 2; // Center the bars vertically

      // Create gradient for each bar based on position and activity
      const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);

      if (isSpeaking) {
        // Active state - blue gradient from dark to light
        const intensity = dataArray[i] / 255;
        if (intensity > 0.7) {
          gradient.addColorStop(0, "#1e40af"); // Dark blue
          gradient.addColorStop(0.5, "#3b82f6"); // Medium blue
          gradient.addColorStop(1, "#60a5fa"); // Light blue
        } else if (intensity > 0.4) {
          gradient.addColorStop(0, "#1e3a8a"); // Darker blue
          gradient.addColorStop(0.5, "#2563eb"); // Medium blue
          gradient.addColorStop(1, "#3b82f6"); // Light blue
        } else {
          gradient.addColorStop(0, "#1e293b"); // Very dark blue
          gradient.addColorStop(0.5, "#1e40af"); // Dark blue
          gradient.addColorStop(1, "#2563eb"); // Medium blue
        }
      } else {
        // Idle state - subtle gray gradient
        gradient.addColorStop(0, "#374151");
        gradient.addColorStop(0.5, "#4b5563");
        gradient.addColorStop(1, "#6b7280");
      }

      ctx.fillStyle = gradient;

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 4);
      ctx.fill();

      // Add glow effect for active bars
      if (isSpeaking && dataArray[i] > 180) {
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 4);
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
      }
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
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-xl">
      {/* Header with Speaker Icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`p-3 rounded-full transition-all duration-300 ${
              isSpeaking
                ? "bg-blue-500 text-white shadow-lg scale-110 animate-pulse"
                : "bg-white text-blue-500 shadow-md border border-blue-200"
            }`}
          >
            <Volume2
              className={`w-6 h-6 transition-transform duration-300 ${
                isSpeaking ? "animate-bounce" : ""
              }`}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              🤖 AI Interviewer
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${isSpeaking ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}
              ></div>
              {isSpeaking ? "Speaking..." : "Ready to speak"}
            </p>
          </div>
        </div>

        {showControls && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowText(!showText)}
              className="p-2 rounded-lg bg-white/70 hover:bg-white transition-colors duration-200 text-gray-600 hover:text-gray-800"
              title={showText ? "Hide text" : "Show text"}
            >
              {showText ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleSpeakToggle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isSpeaking
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title={isSpeaking ? "Stop speaking" : "Start speaking"}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Waveform Canvas */}
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="w-full h-24 rounded-xl bg-gray-900 border border-gray-700 shadow-inner"
        />

        {/* Overlay text when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-400/30">
              <span className="text-blue-300 font-medium text-sm flex items-center">
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                Audio Playing...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Text Display (toggleable) */}
      {showText && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Volume2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-2">
                Interview Question
              </h4>
              <p className="text-gray-700 leading-relaxed">{text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Controls Info */}
      {!showText && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isSpeaking
              ? "🔊 Audio is playing"
              : "Click the speaker to hear the question"}
          </p>
          <button
            onClick={() => setShowText(true)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            or click the eye icon to read the text
          </button>
        </div>
      )}
    </div>
  );
};

export default WaveformVisualizer;
