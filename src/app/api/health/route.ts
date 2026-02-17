/**
 * Next.js API Route: GET /api/health
 * Health check endpoint for monitoring.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      sora2: !!process.env.SORA_2_API_KEY ? "configured" : "missing",
      shotstack: !!process.env.SHOTSTACK_API_KEY ? "configured" : "missing",
      openai: !!process.env.OPENAI_API_KEY ? "configured" : "missing",
      apify: !!process.env.APIFY_API_KEY ? "configured" : "missing",
    },
    environment: process.env.NODE_ENV || "development",
  };

  const allConfigured = Object.values(health.services).every(
    (s) => s === "configured"
  );

  return NextResponse.json(health, {
    status: allConfigured ? 200 : 503,
  });
}
