import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  UserTable: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  InterviewSessionTable: defineTable({
    interviewQuestions: v.any(),
    resumeUrl: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    userId: v.string(),
    status: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    userResponses: v.optional(
      v.array(
        v.object({
          questionIndex: v.number(),
          question: v.string(),
          expectedAnswer: v.optional(v.string()),
          userAnswer: v.string(),
          feedback: v.optional(v.string()),
          timestamp: v.number(),
        })
      )
    ),
  }),
});
