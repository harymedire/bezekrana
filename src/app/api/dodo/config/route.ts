import { NextResponse } from "next/server";

// Tells the inline checkout component which Dodo environment to load against.
// Safe to expose: just the mode flag, no keys.
export async function GET() {
  return NextResponse.json({
    mode: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live" : "test",
  });
}
