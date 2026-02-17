/**
 * Next.js API Route: POST /api/generate-video
 * Main video generation endpoint.
 * Accepts product image URL, avatar URL, and marketing angle.
 * Returns the generated video URL and pipeline output.
 */

import { NextRequest, NextResponse } from "next/server";
import { smartVideoPipeline } from "../../../../engines/orchestrator/smartVideoPipeline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productImageUrl, avatarImageUrl, marketingAngle, options } = body;

    // Validate required fields
    if (!productImageUrl) {
      return NextResponse.json(
        { error: "productImageUrl is required." },
        { status: 400 }
      );
    }
    if (!avatarImageUrl) {
      return NextResponse.json(
        { error: "avatarImageUrl is required." },
        { status: 400 }
      );
    }

    // Run the pipeline
    const result = await smartVideoPipeline({
      productImageUrl,
      avatarImageUrl,
      marketingAngle: marketingAngle || "Product spotlight",
      options: {
        generatePrompt: options?.generatePrompt ?? true,
        generateScript: options?.generateScript ?? true,
        sendToSora2: options?.sendToSora2 ?? true,
        enableShotstack: options?.enableShotstack ?? true,
        logSteps: options?.logSteps ?? false,
      },
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      prompt: result.prompt,
      output: result.output,
    });
  } catch (error: any) {
    console.error("Video generation API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
