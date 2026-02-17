/**
 * Scene Generator - Generates video scenes via Sora-2/Vidgo API.
 * Handles image-to-video and text-to-video generation modes.
 */

import axios from "axios";

const VIDGO_API_BASE = "https://api.vidgo.ai/v1/video-series";

export interface SceneGenerationInput {
  prompt: string;
  duration: number;
  referenceImage?: string;
  resolution?: "720p" | "1080p";
  aspectRatio?: "16:9" | "9:16" | "1:1";
}

export interface SceneGenerationResult {
  taskId: string;
  status: "pending" | "processing" | "finished" | "failed";
  videoUrl?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Submit a scene for video generation via the Vidgo/Sora-2 API.
 */
export async function generateScene(
  input: SceneGenerationInput,
  apiKey: string
): Promise<SceneGenerationResult> {
  if (!apiKey) {
    throw new Error("SORA_2_API_KEY is required for scene generation.");
  }

  const generationType = input.referenceImage ? "image-to-video" : "text-to-video";

  const response = await axios.post(
    `${VIDGO_API_BASE}/generate`,
    {
      prompt: input.prompt,
      duration: input.duration || 8,
      resolution: input.resolution || "1080p",
      aspect_ratio: input.aspectRatio || "16:9",
      generation_type: generationType,
      reference_images: input.referenceImage ? [input.referenceImage] : [],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const taskId = response.data?.task_id || response.data?.id;
  if (!taskId) {
    throw new Error("Vidgo API did not return a task ID.");
  }

  return { taskId, status: "pending" };
}

/**
 * Poll for scene generation status.
 */
export async function pollSceneStatus(
  taskId: string,
  apiKey: string
): Promise<SceneGenerationResult> {
  const response = await axios.get(`${VIDGO_API_BASE}/status/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const status = String(response.data?.status || "pending").toLowerCase();
  const videoUrl = response.data?.output_url || response.data?.video_url || null;
  const previewUrl = response.data?.preview_url || response.data?.thumbnail_url || null;

  return {
    taskId,
    status: status as SceneGenerationResult["status"],
    videoUrl: videoUrl || undefined,
    previewUrl: previewUrl || undefined,
  };
}
