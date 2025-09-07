import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/next";

const isDevelopment = process.env.NODE_ENV === "development";

export const aj = arcjet({
  key: process.env.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: isDevelopment ? "DRY_RUN" : "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: isDevelopment ? "DRY_RUN" : "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: isDevelopment ? "DRY_RUN" : "LIVE", // Set to DRY_RUN in development
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: isDevelopment ? 100 : 5, // Much higher rate in development
      interval: isDevelopment ? 1000 : 5000, // Faster refill in development
      capacity: isDevelopment ? 1000 : 10, // Much higher capacity in development
    }),
  ],
});
