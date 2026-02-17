/**
 * Prompt Pipeline - Core module for generating video prompts from product data.
 * Re-exported by the root prompt-pipeline.ts for convenience.
 */

import type {
  ProductTruth,
  MarketInsight,
  ProductMatch,
  OrchestrateResult,
  Veo3Prompt,
  ShotstackTimelineEntry,
} from "./types";

export interface PipelineInput {
  productName: string;
  productDescription?: string;
  features?: string[];
  productImageUrl?: string;
  productImageBase64?: string;
  truth?: ProductTruth;
  market?: MarketInsight;
  match?: ProductMatch;
}

export interface PipelineOutput {
  ok: boolean;
  prompts: Veo3Prompt[];
  timeline: ShotstackTimelineEntry[];
  traceability: string[];
  error?: string;
}

/**
 * Run the full prompt pipeline: analyze product -> generate prompts -> build timeline.
 */
export async function runPromptPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const traceability: string[] = [];

  try {
    // Step 1: Extract or use provided product truth
    const truth = input.truth || {
      object_form: [input.productName.toLowerCase()],
      materials: ["unknown"],
      colors: ["unknown"],
      visible_parts: [],
      visual_constraints: ["show product only"],
    };

    if (!input.truth) {
      traceability.push("Product truth was not provided; using defaults from product name.");
    }

    // Step 2: Use or generate market insights
    const market = input.market || {
      hooks: [`${input.productName} close-up reveal`],
      ctaStyles: [`${input.productName} call-to-action`],
      visualPatterns: ["clean product spotlight"],
      engagementSignals: ["quick reveal"],
    };

    if (!input.market) {
      traceability.push("Market insights not provided; using defaults.");
    }

    // Step 3: Generate scene prompts
    const prompts: Veo3Prompt[] = [
      {
        sceneId: "scene_01_intro",
        prompt: `Cinematic product reveal: ${truth.object_form.join(", ")} made of ${truth.materials.join(", ")} in ${truth.colors.join(", ")}. ${market.hooks[0]}. Professional lighting, clean background.`,
        duration: 4,
        referenceImage: input.productImageUrl || input.productImageBase64,
      },
      {
        sceneId: "scene_02_detail",
        prompt: `Macro close-up of ${truth.visible_parts.join(" and ") || input.productName}, showing texture and quality. Smooth camera movement. ${market.visualPatterns[0]}.`,
        duration: 3,
        referenceImage: input.productImageUrl || input.productImageBase64,
      },
      {
        sceneId: "scene_03_cta",
        prompt: `${market.ctaStyles[0]}. Product centered, bold composition. ${market.engagementSignals.join(", ")}.`,
        duration: 3,
        referenceImage: input.productImageUrl || input.productImageBase64,
      },
    ];

    // Step 4: Build Shotstack timeline
    const timeline: ShotstackTimelineEntry[] = prompts.map((p, i) => ({
      sceneId: p.sceneId,
      label: p.sceneId.replace("_", " "),
      duration: p.duration,
      transition: i === 0 ? "none" as const : "fade" as const,
      assetRef: input.productImageUrl || input.productImageBase64 || "",
    }));

    if (input.productImageUrl) {
      traceability.push(`Using product image URL: ${input.productImageUrl}`);
    } else if (input.productImageBase64) {
      traceability.push("Using base64-encoded product image.");
    } else {
      traceability.push("WARNING: No product image provided. Video generation may use text-only mode.");
    }

    return { ok: true, prompts, timeline, traceability };
  } catch (error: any) {
    return {
      ok: false,
      prompts: [],
      timeline: [],
      traceability,
      error: error.message || String(error),
    };
  }
}

export { type OrchestrateResult, type Veo3Prompt, type ShotstackTimelineEntry };
