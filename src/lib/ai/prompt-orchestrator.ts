/**
 * Prompt Orchestrator - Generates Veo3/Sora-2 prompts and Shotstack timelines
 * from product truth, market insights, and asset matching data.
 */

import type {
  ProductTruth,
  MarketInsight,
  ProductMatch,
  OrchestrateResult,
  Veo3Prompt,
  ShotstackTimelineEntry,
} from "../types";

export interface OrchestrateInput {
  productName: string;
  truth: ProductTruth;
  market: MarketInsight;
  productMatch: ProductMatch;
}

/**
 * Orchestrate prompts for the video generation pipeline.
 * Returns structured Veo3 prompts and a Shotstack timeline.
 */
export function orchestratePrompts(input: OrchestrateInput): OrchestrateResult {
  const { productName, truth, market, productMatch } = input;

  try {
    // Generate scene prompts based on product truth and market insights
    const veo3Prompts: Veo3Prompt[] = [];

    // Scene 1: Product intro/reveal
    veo3Prompts.push({
      sceneId: "scene_01_intro",
      prompt: buildIntroPrompt(productName, truth, market),
      duration: 4,
    });

    // Scene 2: Detail/feature highlight
    veo3Prompts.push({
      sceneId: "scene_02_detail",
      prompt: buildDetailPrompt(productName, truth, market),
      duration: 3,
    });

    // Scene 3: CTA/closing
    veo3Prompts.push({
      sceneId: "scene_03_cta",
      prompt: buildCtaPrompt(productName, truth, market),
      duration: 3,
    });

    // Build timeline
    const shotstackTimeline: ShotstackTimelineEntry[] = veo3Prompts.map((scene, index) => ({
      sceneId: scene.sceneId,
      label: scene.sceneId.replace(/_/g, " "),
      duration: scene.duration,
      transition: index === 0 ? "none" as const : "fade" as const,
      assetRef: productMatch.compatibleAssets[0]?.url || "",
    }));

    return { ok: true, veo3Prompts, shotstackTimeline };
  } catch (error: any) {
    return { ok: false, reason: error.message || String(error) };
  }
}

function buildIntroPrompt(name: string, truth: ProductTruth, market: MarketInsight): string {
  const form = truth.object_form.join(", ");
  const materials = truth.materials.join(", ");
  const colors = truth.colors.join(", ");
  const hook = market.hooks[0] || `${name} reveal`;

  return `Cinematic product reveal: a ${colors} ${materials} ${form}. ${hook}. Professional studio lighting, clean background, smooth camera dolly. ${truth.visual_constraints.join(". ")}.`;
}

function buildDetailPrompt(name: string, truth: ProductTruth, market: MarketInsight): string {
  const parts = truth.visible_parts.join(" and ") || name;
  const pattern = market.visualPatterns[0] || "clean product spotlight";

  return `Extreme close-up macro shot of ${parts}, revealing texture, quality, and craftsmanship. ${pattern}. Smooth camera movement with shallow depth of field.`;
}

function buildCtaPrompt(name: string, truth: ProductTruth, market: MarketInsight): string {
  const cta = market.ctaStyles[0] || `${name} call-to-action`;
  const signals = market.engagementSignals.join(", ") || "quick reveal";

  return `${cta}. Product centered in frame, bold composition. ${signals}. Clean, minimal background.`;
}
