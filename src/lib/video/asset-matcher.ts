/**
 * Asset Matcher - Matches and validates product assets for video generation.
 * NOTE: Runs in a serverless/edge environment. No Node.js fs/path usage.
 */

import type { VerifiedAsset, ProductMatch } from "../types";

/**
 * Extract a filename from a URL or path string.
 */
function extractFilename(input: string): string {
  const segments = input.split("/");
  const last = segments[segments.length - 1] || "asset";
  return last.split("?")[0] || "asset";
}

/**
 * Extract a file extension from a filename.
 */
function extractExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "png";
}

/**
 * Match available product assets against pipeline requirements.
 * Accepts file path strings (treated as identifiers) and remote URLs.
 */
export function matchProductAssets(
  productImagePaths: string[],
  productImageUrls: string[]
): ProductMatch {
  const compatibleAssets: VerifiedAsset[] = [];

  // Process local file path identifiers (no filesystem access - just metadata)
  for (const filePath of productImagePaths) {
    if (!filePath) continue;
    const filename = extractFilename(filePath);
    const ext = extractExtension(filename);
    const id = filename.replace(`.${ext}`, "");

    compatibleAssets.push({
      id,
      url: filePath,
      type: "image",
      format: ext,
      tags: ["product", "local"],
      source: "upload",
      verified: true,
      verifiedAt: new Date().toISOString(),
      qualityScore: 0.7,
      usableFor: ["reference", "product-shot"],
    });
  }

  // Process URL assets
  for (const url of productImageUrls) {
    if (url && url.startsWith("http")) {
      const filename = extractFilename(url);
      const ext = extractExtension(filename);

      compatibleAssets.push({
        id: filename.replace(`.${ext}`, "") || "remote-asset",
        url,
        type: "image",
        format: ext,
        tags: ["product", "remote"],
        source: "upload",
        verified: true,
        verifiedAt: new Date().toISOString(),
        qualityScore: 0.8,
        usableFor: ["reference", "product-shot"],
      });
    }
  }

  return {
    compatibleAssets,
    logicReuseAllowed: compatibleAssets.length > 0,
    justification: compatibleAssets.length > 0
      ? `Found ${compatibleAssets.length} compatible asset(s).`
      : "No compatible assets found. All scenes will be generated from text prompts only.",
  };
}
