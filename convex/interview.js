import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveInterviewQuestion = mutation({
  args: {
    questions: v.any(),
    uid: v.id("UserTable"),
    resumeUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Saving interview questions with args:", args);

    // Validate that questions exist and are an array
    if (!args.questions || !Array.isArray(args.questions)) {
      throw new Error("Questions must be an array");
    }

    // Validate user exists
    const user = await ctx.db.get(args.uid);
    if (!user) {
      throw new Error("User not found");
    }

    const res = await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.questions,
      userId: args.uid,
      resumeUrl: args.resumeUrl,
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription,
      startTime: Date.now(),
      endTime: Date.now(),
      status: "scheduled",
    });

    console.log("Interview saved with ID:", res);
    return res;
  },
});

export const getInterviewQuestions = query({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("_id"), args.interviewId))
      .collect();
    return res;
  },
});

export const getInterviewById = query({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db.get(args.interviewId);
    return res;
  },
});

export const getUserInterviews = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
    return res;
  },
});

export const addUserResponse = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    questionIndex: v.number(),
    question: v.string(),
    expectedAnswer: v.optional(v.string()),
    userAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    const currentResponses = interview.userResponses || [];
    const newResponse = {
      questionIndex: args.questionIndex,
      question: args.question,
      expectedAnswer: args.expectedAnswer,
      userAnswer: args.userAnswer,
      timestamp: Date.now(),
    };

    const updatedResponses = [...currentResponses, newResponse];

    await ctx.db.patch(args.interviewId, {
      userResponses: updatedResponses,
    });

    return newResponse;
  },
});

export const updateResponseWithFeedback = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    questionIndex: v.number(),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    const userResponses = interview.userResponses || [];
    const updatedResponses = userResponses.map((response) => {
      if (response.questionIndex === args.questionIndex) {
        return { ...response, feedback: args.feedback };
      }
      return response;
    });

    await ctx.db.patch(args.interviewId, {
      userResponses: updatedResponses,
    });

    return updatedResponses;
  },
});

export const addAIInteraction = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    type: v.string(), // "query" or "feedback"
    userQuery: v.optional(v.string()),
    aiResponse: v.string(),
    questionIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    const currentInteractions = interview.aiInteractions || [];
    const newInteraction = {
      type: args.type,
      userQuery: args.userQuery,
      aiResponse: args.aiResponse,
      questionIndex: args.questionIndex,
      timestamp: Date.now(),
    };

    const updatedInteractions = [...currentInteractions, newInteraction];

    await ctx.db.patch(args.interviewId, {
      aiInteractions: updatedInteractions,
    });

    return newInteraction;
  },
});

export const getAIInteractions = query({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }
    return interview.aiInteractions || [];
  },
});

export const updateInterviewStatus = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    status: v.string(), // "scheduled", "in-progress", "completed"
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    const updateData = { status: args.status };

    // If marking as in-progress, set startTime if not already set
    if (args.status === "in-progress" && !interview.startTime) {
      updateData.startTime = Date.now();
    }

    // If marking as completed, set endTime
    if (args.status === "completed") {
      updateData.endTime = Date.now();
    }

    await ctx.db.patch(args.interviewId, updateData);
    return await ctx.db.get(args.interviewId);
  },
});

export const updateLastActivity = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    await ctx.db.patch(args.interviewId, {
      lastActivityTime: Date.now(),
    });

    return await ctx.db.get(args.interviewId);
  },
});

export const checkInterviewTimeout = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // If already timed out or completed, return current status
    if (interview.isTimedOut || interview.status === "completed") {
      return interview;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const lastActivity = interview.lastActivityTime || interview.startTime;

    // Check if interview has been inactive for more than 1 hour
    if (lastActivity && now - lastActivity > oneHour) {
      await ctx.db.patch(args.interviewId, {
        status: "timed-out",
        isTimedOut: true,
        timeoutReason: "Inactive for more than 1 hour",
        endTime: now,
      });

      return await ctx.db.get(args.interviewId);
    }

    return interview;
  },
});

export const deleteInterview = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    await ctx.db.delete(args.interviewId);
    return { success: true, deletedId: args.interviewId };
  },
});
