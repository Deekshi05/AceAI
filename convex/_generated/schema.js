import { defineSchema } from "convex/server";
import { V } from "framer-motion/dist/types.d-Cjd591yU";

export default defineSchema({
    UserTable:defineTable({
        name:V.string(),
        imageUrl:V.string(),
        email:V.string(),
    })
})