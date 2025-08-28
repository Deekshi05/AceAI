import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  UserTable: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
