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
