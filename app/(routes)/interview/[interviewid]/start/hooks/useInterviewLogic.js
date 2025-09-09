// Interview logic hooks and utilities
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { processUserResponse, processN8nResponse } from "@/utils/feedbackUtils";

export const useInterviewLogic = (
  interviewData,
  setConversation,
  setCurrentQuestionIndex
) => {
  const convex = useConvex();

  const addQuestionToChat = (questionIndex) => {
    const question = interviewData?.interviewQuestions?.[questionIndex];
    if (question) {
      setConversation((prev) => [
        ...prev,
        {
          type: "question",
          content: question.question,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const submitAnswer = async (currentTranscript, currentQuestionIndex) => {
    if (currentTranscript.trim()) {
      console.log("=== User Response Submission Started ===");
      console.log("Question Index:", currentQuestionIndex);
      console.log("User Response:", currentTranscript.trim());

      // First add the current question to chat
      const currentQuestion =
        interviewData?.interviewQuestions?.[currentQuestionIndex];
      if (currentQuestion) {
        console.log("Current Question:", currentQuestion.question);
        setConversation((prev) => [
          ...prev,
          {
            type: "question",
            content: currentQuestion.question,
            timestamp: new Date(),
          },
        ]);
      }

      // Then add user's answer to conversation
      setTimeout(() => {
        console.log("User submitted answer:", currentTranscript.trim());
        setConversation((prev) => [
          ...prev,
          {
            type: "answer",
            content: currentTranscript.trim(),
            timestamp: new Date(),
          },
        ]);
      }, 300);

      // Store user response in Convex
      try {
        await convex.mutation(api.interview.addUserResponse, {
          interviewId: interviewData._id,
          questionIndex: currentQuestionIndex,
          question: currentQuestion.question,
          expectedAnswer: currentQuestion.expectedAnswer || "",
          userAnswer: currentTranscript.trim(),
        });

        // Send to n8n webhook for feedback/response
        const webhookData = {
          question: currentQuestion.question,
          expectedAnswer: currentQuestion.expectedAnswer || "",
          userResponse: currentTranscript.trim(),
          questionIndex: currentQuestionIndex,
          interviewId: interviewData._id,
        };

        // Show loading message
        setTimeout(() => {
          setConversation((prev) => [
            ...prev,
            {
              type: "system",
              content: "🤖 AI is analyzing your response...",
              timestamp: new Date(),
              isLoading: true,
            },
          ]);
        }, 600);

        // Call n8n webhook for AI processing
        console.log("Sending user response to AI for processing:", webhookData);
        const n8nResponse = await processUserResponse(
          currentQuestion.question,
          currentQuestion.expectedAnswer || "",
          currentTranscript.trim(),
          interviewData._id
        );
        const processedResponse = processN8nResponse(n8nResponse);

        // Remove loading message first
        setConversation((prev) => prev.filter((msg) => !msg.isLoading));

        // Handle feedback - store in Convex but don't show in chat
        if (processedResponse.type === "feedback") {
          console.log(
            "AI provided feedback (stored but not displayed):",
            processedResponse.content
          );
          await convex.mutation(api.interview.updateResponseWithFeedback, {
            interviewId: interviewData._id,
            questionIndex: currentQuestionIndex,
            feedback: processedResponse.content,
          });
        }
        // Handle hints - show to user
        else if (processedResponse.type === "hint") {
          console.log(
            "AI provided hint (displayed to user):",
            processedResponse.content
          );
          setTimeout(() => {
            setConversation((prev) => [
              ...prev,
              {
                type: "hint",
                content: processedResponse.content,
                timestamp: new Date(),
              },
            ]);
          }, 300);
        }
      } catch (error) {
        console.error("Error processing response:", error);
        setConversation((prev) => {
          const withoutLoading = prev.filter((msg) => !msg.isLoading);
          return [
            ...withoutLoading,
            {
              type: "system",
              content:
                "❌ Sorry, there was an error processing your response. Please try again.",
              timestamp: new Date(),
            },
          ];
        });
      }

      // Move to next question if available
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < (interviewData?.interviewQuestions?.length || 0)) {
        console.log("Moving to next question:", nextIndex);
        setTimeout(() => {
          setCurrentQuestionIndex(nextIndex);
        }, 1200);
      } else {
        // Interview completed
        console.log("Interview completed! All questions answered.");
        setTimeout(() => {
          setConversation((prev) => [
            ...prev,
            {
              type: "system",
              content: "🎉 Interview completed! Thank you for your responses.",
              timestamp: new Date(),
            },
          ]);
        }, 1200);
      }

      console.log("=== User Response Submission Completed ===");
      return true; // Success
    }
    return false; // No transcript to submit
  };

  return {
    addQuestionToChat,
    submitAnswer,
  };
};
