/**
 * Video Assembler - Assembles final video using Shotstack API.
 */

import axios from "axios";

const SHOTSTACK_PROD_URL = "https://api.shotstack.io/edit/v1";
const SHOTSTACK_SANDBOX_URL = "https://api.shotstack.io/stage/v1";

export interface AssemblyInput {
  scenes: Array<{
    videoUrl: string;
    duration: number;
    transition: "fade" | "none";
  }>;
  outputFormat?: "mp4";
  resolution?: "sd" | "hd" | "fhd";
  fps?: 25 | 30;
}

export interface AssemblyResult {
  renderId: string;
  status: "queued" | "rendering" | "done" | "failed";
  url?: string;
  error?: string;
}

/**
 * Submit a video assembly job to Shotstack.
 */
export async function assembleVideo(
  input: AssemblyInput,
  apiKey: string,
  env: "production" | "sandbox" = "sandbox"
): Promise<AssemblyResult> {
  if (!apiKey) {
    throw new Error("SHOTSTACK_API_KEY is required for video assembly.");
  }

  const baseUrl = env === "production" ? SHOTSTACK_PROD_URL : SHOTSTACK_SANDBOX_URL;

  // Build Shotstack timeline from scenes
  const clips = input.scenes.map((scene, index) => ({
    asset: {
      type: "video",
      src: scene.videoUrl,
    },
    start: input.scenes.slice(0, index).reduce((sum, s) => sum + s.duration, 0),
    length: scene.duration,
    transition: scene.transition === "fade" ? { in: "fade", out: "fade" } : undefined,
  }));

  const timeline = {
    tracks: [{ clips }],
  };

  const payload = {
    timeline,
    output: {
      format: input.outputFormat || "mp4",
      resolution: input.resolution || "sd",
      fps: input.fps || 25,
    },
  };

  const response = await axios.post(`${baseUrl}/render`, payload, {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  const renderId = response.data?.response?.id;
  if (!renderId) {
    throw new Error("Shotstack did not return a render ID.");
  }

  return { renderId, status: "queued" };
}

/**
 * Poll for video assembly status.
 */
export async function pollAssemblyStatus(
  renderId: string,
  apiKey: string,
  env: "production" | "sandbox" = "sandbox"
): Promise<AssemblyResult> {
  const baseUrl = env === "production" ? SHOTSTACK_PROD_URL : SHOTSTACK_SANDBOX_URL;

  const response = await axios.get(`${baseUrl}/render/${renderId}`, {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  const status = response.data?.response?.status || "queued";
  const url = response.data?.response?.url || null;

  return {
    renderId,
    status: status as AssemblyResult["status"],
    url: url || undefined,
  };
}
