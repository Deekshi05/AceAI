// Utility functions for handling feedback via n8n webhook
import axios from "axios";

// Function to test n8n webhook connectivity
export const testN8nConnection = async () => {
  try {
    // Test health endpoint
    const healthResponse = await axios.get("http://localhost:5678/healthz", {
      timeout: 3000,
    });

    if (healthResponse.status === 200) {
      console.log("✅ n8n service is running");

      // Test webhook endpoint with a simple ping
      const webhookUrl =
        process.env.N8N_AI_FEEDBACK_WEBHOOK_URL ||
        "http://localhost:5678/webhook/generate-feedback";

      const testData = {
        type: "test_connection",
        message: "Testing webhook connectivity",
        timestamp: new Date().toISOString(),
      };

      try {
        const webhookResponse = await axios.post(webhookUrl, testData, {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
          validateStatus: (status) => status < 500,
        });

        if (webhookResponse.status < 400) {
          console.log("✅ n8n webhook is responding");
          return { success: true, message: "n8n webhook is working correctly" };
        } else {
          console.log(`⚠️ Webhook returned status: ${webhookResponse.status}`);
          return {
            success: false,
            message: `Webhook returned status: ${webhookResponse.status}`,
          };
        }
      } catch (webhookError) {
        console.log("❌ Webhook test failed:", webhookError.message);
        return {
          success: false,
          message: `Webhook test failed: ${webhookError.message}`,
        };
      }
    }
  } catch (error) {
    console.log("❌ n8n service is not accessible:", error.message);
    return {
      success: false,
      message: `n8n service is not accessible: ${error.message}`,
    };
  }
};
// Function to process user response and generate AI feedback/hints
export const processUserResponse = async (
  question,
  expectedAnswer,
  userResponse,
  interviewId
) => {
  const requestData = {
    type: "user_response",
    question: question,
    expectedAnswer: expectedAnswer,
    userResponse: userResponse,
    interviewId: interviewId,
    timestamp: new Date().toISOString(),
  };

  try {
    return await sendToN8nWebhook(requestData);
  } catch (error) {
    console.warn("Webhook not available, providing fallback feedback");
    // Provide a fallback feedback when webhook is not available
    return {
      type: "feedback",
      content: `Thank you for your response. Your answer has been recorded and will be reviewed. Keep up the good work!`,
      timestamp: new Date().toISOString(),
    };
  }
};

// Function to process user query for AI clarification
export const processUserQuery = async (
  userQuery,
  currentQuestion,
  interviewId,
  questionIndex
) => {
  const requestData = {
    type: "user_query",
    userQuery: userQuery,
    currentQuestion: currentQuestion,
    interviewId: interviewId,
    questionIndex: questionIndex,
    timestamp: new Date().toISOString(),
  };

  try {
    return await sendToN8nWebhook(requestData);
  } catch (error) {
    console.warn("Webhook not available, providing fallback response");
    // Provide a fallback response when webhook is not available
    return {
      type: "clarification",
      content: `Thank you for your question: "${userQuery}". 

Regarding the current question: "${currentQuestion}"

Here's some general guidance:
- Take your time to think through the question
- Structure your answer clearly
- Provide specific examples if possible
- Explain your reasoning

If you need more specific help, please try asking more detailed questions about particular aspects of the question.`,
      timestamp: new Date().toISOString(),
    };
  }
};

export const sendToN8nWebhook = async (questionData) => {
  try {
    // Get the webhook URL from environment variables with fallback to production webhook
    const webhookUrl =
      process.env.N8N_AI_FEEDBACK_WEBHOOK_URL ||
      `http://localhost:5678/webhook/generate-feedback`;

    console.log("Attempting to call n8n webhook:", webhookUrl);
    console.log("Request data:", questionData);

    // First check if n8n service is running
    try {
      const healthCheck = await axios.get("http://localhost:5678/healthz", {
        timeout: 3000,
      });
      if (healthCheck.status !== 200) {
        throw new Error("n8n service is not healthy");
      }
    } catch (healthError) {
      throw new Error(`n8n service is not accessible: ${healthError.message}`);
    }

    // Always use the generate-feedback endpoint, differentiate by type in data
    const response = await axios.post(webhookUrl, questionData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000, // 15 second timeout for AI processing
      validateStatus: function (status) {
        return status < 500; // Accept all status codes below 500
      },
    });

    if (response.status >= 400) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${response.data?.message || "Unknown error"}`
      );
    }

    const result = response.data;
    console.log(`AI Response received from n8n webhook:`, result);
    return result;
  } catch (error) {
    console.error(`Error calling n8n webhook:`, error.message || error);

    // Check if it's a network error
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("Network Error") ||
      error.message.includes("service is not accessible")
    ) {
      console.warn(
        "n8n service appears to be unavailable. Make sure n8n is running on the specified port."
      );
      throw new Error(
        "n8n service is currently unavailable. Please ensure n8n Docker container is running."
      );
    }

    // Check if it's a webhook registration error
    if (error.response && error.response.status === 404) {
      console.warn(
        "n8n webhook 'generate-feedback' is not registered. Please ensure the workflow is activated in n8n and the webhook is properly configured."
      );
      throw new Error(
        "Webhook endpoint not found. Please check if the n8n workflow is active and webhook is configured."
      );
    }

    // Check for workflow execution errors
    if (error.response && error.response.status === 500) {
      console.warn(
        "n8n workflow execution error. The workflow may have configuration issues."
      );
      throw new Error(
        "Workflow execution failed. Please check the n8n workflow configuration."
      );
    }

    // Check for other HTTP errors
    if (error.response && error.response.status >= 400) {
      console.warn(
        `n8n webhook returned HTTP ${error.response.status}: ${error.response.data?.message || "Unknown error"}`
      );
    }

    throw error;
  }
};

export const processN8nResponse = (response) => {
  console.log("Processing AI response:", response);

  // Process response based on AI model's type tag

  if (response.type === "feedback") {
    const processedResponse = {
      type: "feedback",
      content: response.content || response.feedback || response.message,
    };
    console.log("AI Response processed as feedback:", processedResponse);
    return processedResponse;
  } else if (response.type === "hint") {
    const processedResponse = {
      type: "hint",
      content: response.content || response.hint || response.message,
    };
    console.log("AI Response processed as hint:", processedResponse);
    return processedResponse;
  } else if (response.type === "clarification") {
    const processedResponse = {
      type: "clarification",
      content: response.content || response.clarification || response.message,
    };
    console.log("AI Response processed as clarification:", processedResponse);
    return processedResponse;
  } else {
    // Default processing for backward compatibility
    const content =
      response.content || response.message || JSON.stringify(response);

    // If no type is specified, try to determine from content
    if (
      content.toLowerCase().includes("feedback") ||
      content.toLowerCase().includes("score") ||
      content.toLowerCase().includes("rating")
    ) {
      const processedResponse = {
        type: "feedback",
        content: content,
      };
      console.log("AI Response auto-detected as feedback:", processedResponse);
      return processedResponse;
    } else {
      const processedResponse = {
        type: "hint",
        content: content,
      };
      console.log("AI Response auto-detected as hint:", processedResponse);
      return processedResponse;
    }
  }
};
