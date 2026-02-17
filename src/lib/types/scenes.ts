/**
 * Type definitions for generated scenes and scene collections.
 */

export interface GeneratedScene {
  sceneId: string;
  label: string;
  prompt: string;
  duration: number;
  transition: "fade" | "none" | "dissolve" | "wipe";
  assetRef: string;
  videoUrl?: string;
  status: "pending" | "generating" | "completed" | "failed";
}

export interface SceneCollection {
  scenes: GeneratedScene[];
  totalDuration: number;
  createdAt: string;
}

export interface ShotstackTimelineEntry {
  sceneId: string;
  label: string;
  duration: number;
  transition: "fade" | "none";
  assetRef: string;
}

export interface Veo3Prompt {
  sceneId: string;
  prompt: string;
  duration: number;
  referenceImage?: string;
}

export interface OrchestrateResult {
  ok: boolean;
  reason?: string;
  veo3Prompts?: Veo3Prompt[];
  shotstackTimeline?: ShotstackTimelineEntry[];
}
