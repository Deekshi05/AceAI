// Test with the exact payload structure your Next.js API sends
const axios = require("axios");

async function testActualNextJSPayload() {
  console.log("Testing with actual Next.js payload structure...\n");

  // Test case 1: Without resume (job details only)
  console.log("🔸 Testing WITHOUT resume (job details only)...");
  try {
    const webhookPayload = {
      resumeUrl: null,
      fileName: null,
      jobTitle: "Frontend Developer",
      jobDescription: "Looking for a React developer with 3+ years experience",
    };

    console.log("Payload:", JSON.stringify(webhookPayload, null, 2));

    const response = await axios.post(
      "http://localhost:5678/webhook/generate-interview-questions",
      webhookPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // Same timeout as your Next.js app
      }
    );

    console.log("✅ SUCCESS: Without resume");
    console.log("Status:", response.status);
    console.log("Response type:", typeof response.data);
    console.log("Is array:", Array.isArray(response.data));
    if (Array.isArray(response.data)) {
      console.log("Number of questions:", response.data.length);
    }
  } catch (error) {
    console.log("❌ FAILED: Without resume");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Status Text:", error.response.statusText);
      console.log("Response:", error.response.data);
    } else if (error.request) {
      console.log("No response received. Request was made but no response.");
      console.log("Error message:", error.message);
    } else {
      console.log("Error setting up request:", error.message);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test case 2: With resume URL (simulating file upload)
  console.log("🔸 Testing WITH resume URL...");
  try {
    const webhookPayload = {
      resumeUrl: "https://ik.imagekit.io/vvub6ajiqw/resumes/sample-resume.pdf",
      fileName: "sample-resume.pdf",
      jobTitle: "Frontend Developer",
      jobDescription: "Looking for a React developer with 3+ years experience",
    };

    console.log("Payload:", JSON.stringify(webhookPayload, null, 2));

    const response = await axios.post(
      "http://localhost:5678/webhook/generate-interview-questions",
      webhookPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 120000, // Same timeout as your Next.js app
      }
    );

    console.log("✅ SUCCESS: With resume");
    console.log("Status:", response.status);
    console.log("Response type:", typeof response.data);
    console.log("Is array:", Array.isArray(response.data));
    if (Array.isArray(response.data)) {
      console.log("Number of questions:", response.data.length);
    }
  } catch (error) {
    console.log("❌ FAILED: With resume");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Status Text:", error.response.statusText);
      console.log("Response:", error.response.data);
    } else if (error.request) {
      console.log("No response received. Request was made but no response.");
      console.log("Error message:", error.message);
    } else {
      console.log("Error setting up request:", error.message);
    }
  }
}

testActualNextJSPayload().catch(console.error);
