// Utility functions for handling feedback via n8n webhook

// Function to process user response and generate AI feedback/hints
export const processUserResponse = async (
  question,
  referenceAnswer,
  userResponse,
  interviewId
) => {
  const requestData = {
    question: question,
    referenceAnswer: referenceAnswer,
    userResponse: userResponse,
    interviewId: interviewId,
    timestamp: new Date().toISOString(),
    type: "user_response",
  };

  return await sendToN8nWebhook(requestData);
};

export const sendToN8nWebhook = async (questionData) => {
  try {
    const response = await fetch(
      "http://localhost:5678/webhook/generate-feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("AI Response received from n8n webhook:", result);
    return result;
  } catch (error) {
    console.error("Error calling n8n webhook:", error);
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
