import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveInterviewQuestion = mutation({
    args: {
        questions: v.any(),
        uid: v.id('UserTable'),
        resumeUrl: v.optional(v.string()),
        jobTitle: v.optional(v.string()),
        jobDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
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
        return res;
    }
})