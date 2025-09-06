// Interview logic hooks and utilities

export const useInterviewLogic = (
  interviewData,
  setConversation,
  setCurrentQuestionIndex
) => {
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

  const submitAnswer = (currentTranscript, currentQuestionIndex) => {
    if (currentTranscript.trim()) {
      // Add user's answer to conversation
      setConversation((prev) => [
        ...prev,
        {
          type: "answer",
          content: currentTranscript.trim(),
          timestamp: new Date(),
        },
      ]);

      // Move to next question if available
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < (interviewData?.interviewQuestions?.length || 0)) {
        setCurrentQuestionIndex(nextIndex);
        setTimeout(() => addQuestionToChat(nextIndex), 500);
      } else {
        // Interview completed
        setConversation((prev) => [
          ...prev,
          {
            type: "system",
            content: "Interview completed! Thank you for your responses.",
            timestamp: new Date(),
          },
        ]);
      }

      return true; // Success
    }
    return false; // No transcript to submit
  };

  return {
    addQuestionToChat,
    submitAnswer,
  };
};
