/**
 * Smart Video Pipeline - End-to-end orchestrator connecting UI to video output.
 * Used by runSmartVideoUI.ts to process product images through the full pipeline.
 */

import { analyzeProductImage } from "../../src/lib/ai/vision-analyzer";
import { orchestratePrompts } from "../../src/lib/ai/prompt-orchestrator";
import { generateScene, pollSceneStatus } from "../../src/lib/video/scene-generator";
import { assembleVideo, pollAssemblyStatus } from "../../src/lib/video/video-assembler";
import { matchProductAssets } from "../../src/lib/video/asset-matcher";
import type { ProductTruth, MarketInsight } from "../../src/lib/types";

export interface SmartVideoPipelineInput {
  productImageUrl: string;
  avatarImageUrl: string;
  marketingAngle: string;
  options?: {
    generatePrompt?: boolean;
    generateScript?: boolean;
    sendToSora2?: boolean;
    enableShotstack?: boolean;
    logSteps?: boolean;
  };
}

export interface SmartVideoPipelineResult {
  videoUrl?: string;
  prompt?: string;
  output?: Record<string, unknown>;
  error?: string;
}

/**
 * Run the complete smart video pipeline:
 * 1. Analyze product image (vision AI)
 * 2. Match assets
 * 3. Generate prompts (orchestrator)
 * 4. Generate video scenes (Sora-2/Vidgo)
 * 5. Assemble final video (Shotstack)
 */
export async function smartVideoPipeline(
  input: SmartVideoPipelineInput
): Promise<SmartVideoPipelineResult> {
  const log = input.options?.logSteps ? console.log : () => {};

  try {
    log("Step 1: Validating inputs...");
    if (!input.productImageUrl) {
      throw new Error("productImageUrl is required.");
    }

    // Step 2: Analyze product image
    log("Step 2: Analyzing product image...");
    let truth: ProductTruth = {
      object_form: ["product"],
      materials: ["unknown"],
      colors: ["unknown"],
      visible_parts: [],
      visual_constraints: ["show product only"],
    };

    if (input.options?.generatePrompt !== false) {
      const visionResult = await analyzeProductImage(input.productImageUrl, "product");
      if (visionResult.ok && visionResult.truth) {
        truth = visionResult.truth;
        log("  Vision analysis complete. Confidence:", visionResult.confidence);
      } else {
        log("  Vision analysis failed, using defaults:", visionResult.error);
      }
    }

    // Step 3: Match assets
    log("Step 3: Matching assets...");
    const productMatch = matchProductAssets([], [input.productImageUrl]);

    // Step 4: Generate market insights from marketing angle
    const market: MarketInsight = {
      hooks: [input.marketingAngle],
      ctaStyles: [`${input.marketingAngle} - call to action`],
      visualPatterns: ["clean product spotlight"],
      engagementSignals: ["quick reveal", "macro detail"],
    };

    // Step 5: Orchestrate prompts
    log("Step 4: Orchestrating prompts...");
    const orchestrateResult = orchestratePrompts({
      productName: "Product",
      truth,
      market,
      productMatch,
    });

    if (!orchestrateResult.ok || !orchestrateResult.veo3Prompts) {
      throw new Error(orchestrateResult.reason || "Prompt orchestration failed.");
    }

    const combinedPrompt = orchestrateResult.veo3Prompts
      .map((p) => p.prompt)
      .join("\n\n");

    // Step 6: Generate video scenes via Sora-2
    if (input.options?.sendToSora2 !== false) {
      log("Step 5: Generating video scenes via Sora-2...");
      const apiKey = process.env.SORA_2_API_KEY;
      if (!apiKey) {
        throw new Error("SORA_2_API_KEY environment variable is required.");
      }

      const sceneResults = [];
      for (const scene of orchestrateResult.veo3Prompts) {
        log(`  Generating scene: ${scene.sceneId}...`);
        const result = await generateScene(
          {
            prompt: scene.prompt,
            duration: scene.duration,
            referenceImage: input.productImageUrl,
          },
          apiKey
        );

        // Poll for completion
        let sceneStatus = result;
        while (sceneStatus.status !== "finished" && sceneStatus.status !== "failed") {
          await new Promise((r) => setTimeout(r, 5000));
          sceneStatus = await pollSceneStatus(result.taskId, apiKey);
          log(`  Scene ${scene.sceneId} status: ${sceneStatus.status}`);
        }

        if (sceneStatus.status === "failed") {
          throw new Error(`Scene ${scene.sceneId} generation failed.`);
        }

        sceneResults.push({
          sceneId: scene.sceneId,
          videoUrl: sceneStatus.videoUrl || "",
          duration: scene.duration,
        });
      }

      // Step 7: Assemble with Shotstack
      if (input.options?.enableShotstack !== false) {
        log("Step 6: Assembling final video with Shotstack...");
        const shotstackKey = process.env.SHOTSTACK_API_KEY;
        if (!shotstackKey) {
          throw new Error("SHOTSTACK_API_KEY environment variable is required.");
        }

        const env = (process.env.SHOTSTACK_ENV || "sandbox") as "production" | "sandbox";
        const assemblyResult = await assembleVideo(
          {
            scenes: sceneResults.map((s) => ({
              videoUrl: s.videoUrl,
              duration: s.duration,
              transition: "fade" as const,
            })),
          },
          shotstackKey,
          env
        );

        // Poll for completion
        let assemblyStatus = assemblyResult;
        while (assemblyStatus.status !== "done" && assemblyStatus.status !== "failed") {
          await new Promise((r) => setTimeout(r, 5000));
          assemblyStatus = await pollAssemblyStatus(assemblyResult.renderId, shotstackKey, env);
          log(`  Assembly status: ${assemblyStatus.status}`);
        }

        if (assemblyStatus.status === "failed") {
          throw new Error("Video assembly failed.");
        }

        return {
          videoUrl: assemblyStatus.url,
          prompt: combinedPrompt,
          output: {
            scenes: sceneResults,
            renderId: assemblyResult.renderId,
            timeline: orchestrateResult.shotstackTimeline,
          },
        };
      }

      return {
        prompt: combinedPrompt,
        output: { scenes: sceneResults },
      };
    }

    // Return prompts only (no video generation)
    return {
      prompt: combinedPrompt,
      output: {
        prompts: orchestrateResult.veo3Prompts,
        timeline: orchestrateResult.shotstackTimeline,
      },
    };
  } catch (error: any) {
    return { error: error.message || String(error) };
  }
}
