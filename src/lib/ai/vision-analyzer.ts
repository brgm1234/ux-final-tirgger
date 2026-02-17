/**
 * Vision Analyzer - Extracts product truth from images using AI vision models.
 */

import type { ProductTruth } from "../types";

export interface VisionAnalysisResult {
  ok: boolean;
  truth?: ProductTruth;
  confidence: number;
  error?: string;
}

/**
 * Analyze a product image to extract visual truth data.
 * Uses OpenAI Vision API or falls back to manual extraction.
 */
export async function analyzeProductImage(
  imageBase64: string,
  productName: string
): Promise<VisionAnalysisResult> {
  if (!imageBase64) {
    return {
      ok: false,
      confidence: 0,
      error: "No image provided for vision analysis.",
    };
  }

  try {
    // Validate image data
    const isDataUrl = imageBase64.startsWith("data:");
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(imageBase64.slice(0, 100));

    if (!isDataUrl && !isBase64) {
      return {
        ok: false,
        confidence: 0,
        error: "Invalid image format. Provide a data URL or base64 string.",
      };
    }

    // If OpenAI API key is available, use GPT-4 Vision
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      return await analyzeWithOpenAI(imageBase64, productName, apiKey);
    }

    // Fallback: return placeholder truth
    console.warn("No OPENAI_API_KEY found. Using placeholder truth extraction.");
    return {
      ok: true,
      truth: {
        object_form: [productName.toLowerCase()],
        materials: ["unknown"],
        colors: ["unknown"],
        visible_parts: [],
        visual_constraints: ["show product only", "no extra props"],
      },
      confidence: 0.3,
    };
  } catch (error: any) {
    return {
      ok: false,
      confidence: 0,
      error: error.message || String(error),
    };
  }
}

async function analyzeWithOpenAI(
  imageBase64: string,
  productName: string,
  apiKey: string
): Promise<VisionAnalysisResult> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const imageContent = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this product image of "${productName}". Return a JSON object with these fields:
- object_form: array of strings describing the product shape/form
- materials: array of strings for materials visible
- colors: array of strings for dominant colors
- visible_parts: array of strings for distinct visible components
- visual_constraints: array of strings for things to maintain in video generation

Return ONLY the JSON object, no markdown.`,
          },
          {
            type: "image_url",
            image_url: { url: imageContent },
          },
        ],
      },
    ],
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content || "";
  const truth = JSON.parse(content) as ProductTruth;

  return { ok: true, truth, confidence: 0.85 };
}
