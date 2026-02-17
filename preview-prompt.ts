import fs from "node:fs";
import path from "node:path";
import { orchestratePrompts } from "./src/lib/ai/prompt-orchestrator";

const productName = "Magic Coffee Mug";
const productDescription = "A mug that keeps coffee hot for 12 hours.";
const features = ["Keeps temperature", "Spill-proof lid", "Ergonomic handle"];
const productImageBase64: string | null = null; // insert sample image here if available

const truth = {
  object_form: ["mug"],
  materials: ["ceramic"],
  colors: ["black"],
  visible_parts: ["handle", "lid"],
  visual_constraints: ["show mug only", "no extra props"],
};

const market = {
  hooks: ["Mug close-up with steam"],
  ctaStyles: ["Mug call-to-action with lid shown"],
  visualPatterns: ["clean product spotlight"],
  engagementSignals: ["quick reveal", "macro detail"],
};

const productMatch = {
  compatibleAssets: [],
  logicReuseAllowed: false,
  justification: "No reusable assets provided in this pre-test.",
};

const result = orchestratePrompts({
  productName,
  truth,
  market,
  productMatch,
});

if (!result.ok || !result.veo3Prompts || !result.shotstackTimeline) {
  throw new Error(result.reason || "Prompt orchestration failed");
}

const traceability_notes: string[] = [];
if (!productImageBase64) {
  traceability_notes.push("No product image provided; truth extraction is a placeholder.");
}
traceability_notes.push(`Description not used in orchestration: "${productDescription}"`);
traceability_notes.push(`Features not used in orchestration: ${features.join(", ")}`);
if (productMatch.compatibleAssets.length === 0) {
  traceability_notes.push("No compatible assets supplied; all scenes set to generate.");
}

const output = {
  veo3_prompt: result.veo3Prompts.map((scene) => scene.prompt).join("\n\n"),
  shotstack_timeline: result.shotstackTimeline,
  traceability_notes,
};

const outPath = path.join(process.cwd(), "preview_prompt.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

console.log("✅ Preview prompt saved to preview_prompt.json");
