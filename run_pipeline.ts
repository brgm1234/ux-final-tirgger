import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import dotenv from "dotenv";
// Shotstack REST calls are used directly to avoid SDK runtime issues in local scripts.

/**
 * Local pipeline runner for Sora 2 + Shotstack.
 *
 * ✅ Required env vars in .env.local:
 * - SORA_2_API_KEY=your_vidgo_key
 * - SHOTSTACK_API_KEY=your_shotstack_key
 * - VEO3_PROMPT_IMAGE_URL=https://... (required if no product image URL)
 *
 * ✅ Run (full):
 *   npx tsx run_pipeline.ts
 *
 * ✅ Run (pre-test, first scene only):
 *   npx tsx run_pipeline.ts --pretest
 */

dotenv.config({ path: ".env.local" });

type PreviewInput = {
  task?: string;
  description?: string;
  product?: {
    name?: string;
    description?: string;
    features?: string[];
    images?: string[];
  };
  prompt_orchestrator?: {
    function?: string;
    rules?: string[];
  };
  veo3_prompt: string;
  shotstack_timeline: Array<{
    sceneId: string;
    label: string;
    duration: number;
    transition: "fade" | "none";
    assetRef: string;
  }>;
  traceability_notes: string[];
  execution_mode?: string;
  output_files?: string[];
};

type SceneResult = {
  sceneId: string;
  prompt: string;
  duration: number;
  videoUrl: string;
  localVideoPath: string;
  previewUrl: string;
  localPreviewPath: string;
};

const BASE_OUTPUT_DIR = path.join(process.cwd(), "pipeline_outputs");
const PRETEST_OUTPUT_DIR = path.join(BASE_OUTPUT_DIR, "pre_test");

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeJson = (filePath: string, data: unknown) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

const appendLog = (message: string, logPath: string) => {
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`, "utf-8");
};

const splitPrompts = (promptText: string) =>
  promptText
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);

const isUrl = (value: string) => /^https?:\/\//i.test(value);

const toDataUrl = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString("base64")}`;
};

const ensurePlaceholderImage = (filePath: string) => {
  const placeholderBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(placeholderBase64, "base64"));
  }
};

const resolvePromptImage = (assetRef: string, traceLog: string) => {
  if (isUrl(assetRef)) return assetRef;

  const absolute = path.isAbsolute(assetRef) ? assetRef : path.join(process.cwd(), assetRef);
  if (!fs.existsSync(absolute)) {
    ensurePlaceholderImage(absolute);
    appendLog(`Asset missing, placeholder created at ${assetRef}`, traceLog);
  }

  return toDataUrl(absolute);
};

const verifyFile = (filePath: string, label: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found at ${filePath}`);
  }
  const size = fs.statSync(filePath).size;
  if (size <= 0) {
    throw new Error(`${label} is empty at ${filePath}`);
  }
};

const downloadFile = async (url: string, filePath: string) => {
  const response = await axios.get(url, { responseType: "stream" });
  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    response.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

const generateVeo3FastVideo = async (promptText: string, promptImage: string, duration: number) => {
  const apiKey = process.env.SORA_2_API_KEY;
  if (!apiKey) throw new Error("Missing SORA_2_API_KEY");

  let createResponse;
  try {
    createResponse = await axios.post(
      "https://api.vidgo.ai/v1/video-series/generate",
      {
        prompt: promptText,
        duration: duration || 8,
        resolution: "1080p",
        aspect_ratio: "16:9",
        generation_type: "text-to-video",
        reference_images: promptImage ? [promptImage] : [],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    const details = error?.response?.data || error?.message || error;
    throw new Error(`Sora 2 create failed: ${JSON.stringify(details)}`);
  }

  const taskId = createResponse.data?.task_id || createResponse.data?.id;
  if (!taskId) throw new Error("Sora 2 did not return task id");

  const statusUrl = `https://api.vidgo.ai/v1/video-series/status/${taskId}`;
  let status = "pending";
  let outputUrl: string | null = null;
  while (status !== "finished" && status !== "failed" && status !== "error") {
    await new Promise((r) => setTimeout(r, 5000));
    const poll = await axios.get(statusUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    status = String(poll.data?.status || "").toLowerCase();
    if (status === "failed" || status === "error") {
      throw new Error("Sora 2 task failed");
    }
    outputUrl = poll.data?.video_url || poll.data?.url || poll.data?.output_url || null;
  }

  return outputUrl;
};

const renderShotstack = async (
  timeline: any,
  outputOptions: { resolution?: "sd" | "hd" | "fhd"; fps?: 25 | 30; quality?: "low" | "medium" | "high"; format?: "mp4" },
  label: string,
  traceLog: string
) => {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  const env = process.env.SHOTSTACK_ENV || "staging";
  if (!apiKey) throw new Error("Missing SHOTSTACK_API_KEY");

  const baseUrl = env === "production" ? "https://api.shotstack.io/edit/v1" : "https://api.shotstack.io/edit/v1";

  const payload = {
    timeline,
    output: {
      format: outputOptions.format || "mp4",
      resolution: outputOptions.resolution || "sd",
      fps: outputOptions.fps || 25,
      quality: outputOptions.quality || "low",
    },
  };

  let renderResponse;
  try {
    renderResponse = await axios.post(
      `${baseUrl}/render`,
      payload,
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    const details = error?.response?.data || error?.message || error;
    throw new Error(`Shotstack render create failed: ${JSON.stringify(details)}`);
  }

  const renderId = renderResponse.data?.response?.id;
  if (!renderId) throw new Error("Shotstack did not return render id");

  appendLog(`${label}: Shotstack render submitted ${renderId}`, traceLog);

  let status = "queued";
  let url: string | null = null;
  const start = Date.now();
  const maxWait = 900000;
  while (status !== "done" && status !== "failed") {
    if (Date.now() - start > maxWait) throw new Error(`${label}: Shotstack render timed out`);
    await new Promise((r) => setTimeout(r, 5000));
    let poll;
    try {
      poll = await axios.get(`${baseUrl}/render/${renderId}`, {
        headers: { "x-api-key": apiKey },
      });
    } catch (error: any) {
      const details = error?.response?.data || error?.message || error;
      throw new Error(`Shotstack render poll failed: ${JSON.stringify(details)}`);
    }
    status = poll.data?.response?.status || status;
    console.log(`[Shotstack ${label}] status=${status}`);
    if (status === "done") {
      url = poll.data?.response?.url || null;
    }
    if (status === "failed") {
      throw new Error(`${label}: Shotstack render failed`);
    }
  }

  if (!url) throw new Error(`${label}: Shotstack render completed with no URL`);
  return url;
};

const buildTimelineFromScenes = (items: PreviewInput["shotstack_timeline"], sceneVideos: Record<string, string>) => {
  const clips: any[] = [];
  let currentTime = 0;

  items.forEach((scene, index) => {
    const videoUrl = sceneVideos[scene.sceneId];
    if (!videoUrl) throw new Error(`Missing video URL for scene ${scene.sceneId}`);

    const clip: any = {
      asset: { type: "video", src: videoUrl },
      start: currentTime,
      length: scene.duration,
    };

    if (scene.transition === "fade" && index < items.length - 1) {
      clip.transition = { in: "fade", out: "fade" };
    }

    clips.push(clip);
    currentTime += scene.duration;
  });

  return { tracks: [{ clips }] };
};

async function main() {
  const pretest = process.argv.includes("--pretest") || process.env.PRETEST === "1";
  const outputDir = pretest ? PRETEST_OUTPUT_DIR : BASE_OUTPUT_DIR;
  const traceLog = path.join(outputDir, "traceability.log");

  ensureDir(outputDir);
  fs.writeFileSync(traceLog, "", "utf-8");

  const inputPath = path.join(process.cwd(), "preview_prompt.json");
  const input: PreviewInput = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  writeJson(path.join(process.cwd(), "pipeline_preview.json"), input);

  appendLog("Pipeline preview generated from preview_prompt.json", traceLog);
  input.traceability_notes.forEach((note) => appendLog(`NOTE: ${note}`, traceLog));

  const prompts = splitPrompts(input.veo3_prompt);
  if (prompts.length !== input.shotstack_timeline.length) {
    if (prompts.length === 1) {
      const repeated = Array(input.shotstack_timeline.length).fill(prompts[0]);
      prompts.splice(0, prompts.length, ...repeated);
      appendLog("Single VEO3 prompt reused for all scenes.", traceLog);
    } else {
      throw new Error(
        `Prompt count (${prompts.length}) does not match timeline scenes (${input.shotstack_timeline.length})`
      );
    }
  }

  const scenesToRun = pretest ? 1 : prompts.length;

  if (!input.shotstack_timeline.every((scene) => scene.assetRef)) {
    throw new Error("One or more scenes are missing assetRef");
  }

  const sceneResults: SceneResult[] = [];
  const sceneVideoMap: Record<string, string> = {};

  for (let i = 0; i < scenesToRun; i++) {
    const timelineScene = input.shotstack_timeline[i];
    const prompt = prompts[i];

    console.log(`\n=== Scene ${timelineScene.sceneId} ===`);
    console.log("[VEO3] Prompt:", prompt);

    const promptImage = resolvePromptImage(timelineScene.assetRef, traceLog);
    const videoUrl = await generateVeo3FastVideo(prompt, promptImage, timelineScene.duration);
    appendLog(`VEO3 generated scene ${timelineScene.sceneId}: ${videoUrl}`, traceLog);

    const sceneVideoPath = path.join(outputDir, `scene_${timelineScene.sceneId}.mp4`);
    await downloadFile(videoUrl, sceneVideoPath);
    verifyFile(sceneVideoPath, `Scene ${timelineScene.sceneId} video`);

    console.log(`[Preview] Generating preview clip for scene ${timelineScene.sceneId}`);
    const previewTimeline = buildTimelineFromScenes(
      [
        {
          ...timelineScene,
          duration: Math.min(2, timelineScene.duration),
          transition: "none",
        },
      ],
      { [timelineScene.sceneId]: videoUrl }
    );

    const previewUrl = await renderShotstack(
      previewTimeline,
      { resolution: "sd", fps: 25, quality: "low", format: "mp4" },
      `preview-${timelineScene.sceneId}`,
      traceLog
    );

    const previewPath = path.join(outputDir, `scene_${timelineScene.sceneId}_preview.mp4`);
    await downloadFile(previewUrl, previewPath);
    verifyFile(previewPath, `Scene ${timelineScene.sceneId} preview`);

    sceneResults.push({
      sceneId: timelineScene.sceneId,
      prompt,
      duration: timelineScene.duration,
      videoUrl,
      localVideoPath: sceneVideoPath,
      previewUrl,
      localPreviewPath: previewPath,
    });

    sceneVideoMap[timelineScene.sceneId] = videoUrl;
  }

  if (pretest) {
    console.log("\n✅ Pre-test complete. Only the first scene was generated.");
    appendLog("Pre-test mode: stopped after first scene.", traceLog);
    return;
  }

  console.log("\n[Shotstack] Building timeline preview...");
  const previewTimeline = buildTimelineFromScenes(input.shotstack_timeline, sceneVideoMap);
  const timelinePreviewUrl = await renderShotstack(
    previewTimeline,
    { resolution: "sd", fps: 25, quality: "low", format: "mp4" },
    "timeline-preview",
    traceLog
  );

  const timelinePreviewPath = path.join(outputDir, "timeline_preview.mp4");
  await downloadFile(timelinePreviewUrl, timelinePreviewPath);
  verifyFile(timelinePreviewPath, "Timeline preview");

  console.log("\n[Shotstack] Building final output...");
  const finalTimeline = buildTimelineFromScenes(input.shotstack_timeline, sceneVideoMap);
  const finalUrl = await renderShotstack(
    finalTimeline,
    { resolution: "hd", fps: 30, quality: "high", format: "mp4" },
    "final-output",
    traceLog
  );

  const finalPath = path.join(outputDir, "final_output.mp4");
  await downloadFile(finalUrl, finalPath);
  verifyFile(finalPath, "Final output");

  console.log("\n✅ Pipeline complete. Outputs saved in pipeline_outputs.");
  appendLog("Pipeline complete. Final output saved.", traceLog);
}

main().catch((error) => {
  console.error("\n❌ Pipeline failed:", error.message || error);
  const pretest = process.argv.includes("--pretest") || process.env.PRETEST === "1";
  const outputDir = pretest ? PRETEST_OUTPUT_DIR : BASE_OUTPUT_DIR;
  const traceLog = path.join(outputDir, "traceability.log");
  ensureDir(outputDir);
  appendLog(`ERROR: ${error.message || error}`, traceLog);
  process.exit(1);
});
