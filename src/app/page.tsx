"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { VideoForm, type VideoFormData } from "@/components/video-form";
import {
  PipelineStatus,
  type PipelineStep,
  type StepStatus,
} from "@/components/pipeline-status";
import { OutputPanel, type GenerationResult } from "@/components/output-panel";

const INITIAL_STEPS: PipelineStep[] = [
  {
    id: "validate",
    label: "Validate Inputs",
    description: "Checking image URLs and configuration",
    status: "idle",
  },
  {
    id: "vision",
    label: "Vision Analysis",
    description: "Extracting product truth from image",
    status: "idle",
  },
  {
    id: "assets",
    label: "Asset Matching",
    description: "Finding compatible product assets",
    status: "idle",
  },
  {
    id: "prompts",
    label: "Prompt Orchestration",
    description: "Generating scene prompts and timeline",
    status: "idle",
  },
  {
    id: "scenes",
    label: "Scene Generation",
    description: "Generating video scenes via Sora-2",
    status: "idle",
  },
  {
    id: "assembly",
    label: "Video Assembly",
    description: "Assembling final video with Shotstack",
    status: "idle",
  },
];

export default function HomePage() {
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateStep = useCallback(
    (id: string, status: StepStatus) => {
      setSteps((prev) =>
        prev.map((step) => (step.id === id ? { ...step, status } : step))
      );
    },
    []
  );

  async function handleGenerate(data: VideoFormData) {
    setIsLoading(true);
    setResult(null);
    setSteps(INITIAL_STEPS);

    // Simulate pipeline progress
    updateStep("validate", "running");
    await delay(600);
    updateStep("validate", "done");

    updateStep("vision", "running");

    try {
      console.log("[v0] Sending generate-video request with:", {
        productImageUrl: data.productImageUrl,
        avatarImageUrl: data.avatarImageUrl,
        marketingAngle: data.marketingAngle,
        options: data.options,
      });

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productImageUrl: data.productImageUrl,
          avatarImageUrl: data.avatarImageUrl,
          marketingAngle: data.marketingAngle,
          options: data.options,
        }),
      });

      // Mark vision as done once we get the response
      updateStep("vision", "done");
      updateStep("assets", "done");
      updateStep("prompts", "done");

      const json = await res.json();

      if (!res.ok || json.error) {
        // Mark remaining steps as error
        updateStep("scenes", "error");
        updateStep("assembly", "error");
        setResult({ success: false, error: json.error || "Request failed" });
      } else {
        updateStep("scenes", "done");
        updateStep("assembly", "done");
        setResult({
          success: true,
          videoUrl: json.videoUrl,
          prompt: json.prompt,
          output: json.output,
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error";
      updateStep("vision", "error");
      setResult({ success: false, error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
        {/* Left column - Form */}
        <div className="w-full lg:w-[380px] lg:shrink-0">
          <VideoForm onSubmit={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Right column - Status + Output */}
        <div className="flex flex-1 flex-col gap-6">
          <PipelineStatus steps={steps} />
          <OutputPanel result={result} />
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4">
        <p className="text-center text-xs text-muted-foreground">
          VidGen Pro v1.0.0 — Powered by Sora-2, OpenAI Vision, and
          Shotstack
        </p>
      </footer>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
