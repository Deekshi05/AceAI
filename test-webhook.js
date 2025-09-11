// Test script to verify n8n webhook functionality
import {
  testN8nConnection,
  processUserResponse,
  processUserQuery,
} from "./utils/feedbackUtils.js";

console.log("🔍 Testing n8n webhook connectivity...\n");

// Test connection
testN8nConnection()
  .then((result) => {
    console.log("Connection test result:", result);

    if (result.success) {
      console.log("\n🔍 Testing user response processing...");

      // Test user response processing
      processUserResponse(
        "What is React?",
        "React is a JavaScript library for building user interfaces",
        "React is a frontend framework for creating web applications",
        "test-interview-123"
      )
        .then((response) => {
          console.log("✅ User response processing successful:", response);

          console.log("\n🔍 Testing user query processing...");

          // Test user query processing
          processUserQuery(
            "Can you give me a hint about React components?",
            "Explain the difference between functional and class components in React",
            "test-interview-123",
            1
          )
            .then((queryResponse) => {
              console.log(
                "✅ User query processing successful:",
                queryResponse
              );
              console.log("\n🎉 All webhook tests passed!");
            })
            .catch((error) => {
              console.error("❌ User query processing failed:", error.message);
            });
        })
        .catch((error) => {
          console.error("❌ User response processing failed:", error.message);
        });
    } else {
      console.log(
        "❌ Cannot proceed with further tests due to connection issues"
      );
    }
  })
  .catch((error) => {
    console.error("❌ Connection test failed:", error);
  });
