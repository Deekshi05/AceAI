// Test script that mimics the exact requests your Next.js app makes
const axios = require("axios");

async function testExactWebhookCalls() {
  console.log("Testing exact webhook calls that Next.js makes...\n");

  // Test 1: Generate Interview Questions (mimicking your Next.js API route)
  console.log("🔸 Testing generate-interview-questions webhook...");
  try {
    const webhookPayload = {
      jobTitle: "Frontend Developer",
      jobDescription: "Looking for a React developer with 3+ years experience",
      experience: "3 years",
      technology: "React, JavaScript, HTML, CSS",
      resumeUrl: null, // Testing without resume first
      userId: "test-user-123",
      interviewId: "test-interview-456",
    };

    console.log("Payload:", JSON.stringify(webhookPayload, null, 2));

    const response = await axios.post(
      "http://localhost:5678/webhook/generate-interview-questions",
      webhookPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AceAI-NextJS/1.0",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("✅ SUCCESS: generate-interview-questions");
    console.log("Status:", response.status);
    console.log("Response type:", typeof response.data);
    console.log(
      "Response preview:",
      JSON.stringify(response.data).substring(0, 200) + "..."
    );
  } catch (error) {
    console.log("❌ FAILED: generate-interview-questions");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Generate Feedback (mimicking your feedback utility)
  console.log("🔸 Testing generate-feedback webhook...");
  try {
    const feedbackPayload = {
      question: "What is React?",
      userAnswer: "React is a JavaScript library for building user interfaces",
      correctAnswer:
        "React is a JavaScript library for building user interfaces, particularly for web applications",
      interviewId: "test-interview-456",
    };

    console.log("Payload:", JSON.stringify(feedbackPayload, null, 2));

    const response = await axios.post(
      "http://localhost:5678/webhook/generate-feedback",
      feedbackPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AceAI-NextJS/1.0",
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log("✅ SUCCESS: generate-feedback");
    console.log("Status:", response.status);
    console.log("Response type:", typeof response.data);
    console.log(
      "Response preview:",
      JSON.stringify(response.data).substring(0, 200) + "..."
    );
  } catch (error) {
    console.log("❌ FAILED: generate-feedback");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }
}

testExactWebhookCalls().catch(console.error);
