/**
 * Type definitions for Apify actor types.
 */

export interface ApifyActorConfig {
  actorId: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ApifyRunResult {
  runId: string;
  datasetId: string;
  status: "READY" | "RUNNING" | "SUCCEEDED" | "FAILED" | "ABORTED";
  items: unknown[];
}

export interface ScrapedAdData {
  platform: "facebook" | "tiktok" | "youtube" | "google";
  title?: string;
  description?: string;
  mediaUrl?: string;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  scrapedAt: string;
}
