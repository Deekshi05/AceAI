import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";
import { isSpoofedBot } from "@arcjet/inspect";
import { NextResponse } from "next/server";
import { aj } from "@/utils/arcjet";

export async function GET(req) {
  // In development, request fewer tokens or use a smaller amount
  const isDevelopment = process.env.NODE_ENV === "development";
  const tokensToRequest = isDevelopment ? 1 : 5; // Request only 1 token in development

  const decision = await aj.protect(req, { requested: tokensToRequest });
  console.log("Arcjet decision", decision);

  // In development mode, don't block requests even if denied
  if (decision.isDenied() && !isDevelopment) {
    if (decision.reason.isRateLimit()) {
      return NextResponse.json(
        { error: "Too Many Requests", reason: decision.reason },
        { status: 429 }
      );
    } else if (decision.reason.isBot()) {
      return NextResponse.json(
        { error: "No bots allowed", reason: decision.reason },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { error: "Forbidden", reason: decision.reason },
        { status: 403 }
      );
    }
  }

  // In development, always continue even if decision is denied (for testing)
  if (isDevelopment && decision.isDenied()) {
    console.log(
      "🚧 Development mode: Allowing denied request for testing purposes"
    );
  }

  // Requests from hosting IPs are likely from bots, so they can usually be
  // blocked. However, consider your use case - if this is an API endpoint
  // then hosting IPs might be legitimate.
  // https://docs.arcjet.com/blueprints/vpn-proxy-detection
  if (decision.ip.isHosting()) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  // Paid Arcjet accounts include additional verification checks using IP data.
  // Verification isn't always possible, so we recommend checking the decision
  // separately.
  // https://docs.arcjet.com/bot-protection/reference#bot-verification
  if (decision.results.some(isSpoofedBot)) {
    return NextResponse.json(
      { error: "Forbidden", reason: decision.reason },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: "Hello world" });
}
