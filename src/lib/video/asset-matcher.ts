/**
 * Asset Matcher - Matches and validates product assets for video generation.
 */

import type { VerifiedAsset, ProductMatch } from "../types";
import fs from "node:fs";
import path from "node:path";

/**
 * Match available product assets against pipeline requirements.
 */
export function matchProductAssets(
  productImagePaths: string[],
  productImageUrls: string[]
): ProductMatch {
  const compatibleAssets: VerifiedAsset[] = [];

  // Check local file assets
  for (const filePath of productImagePaths) {
    const absolute = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (fs.existsSync(absolute)) {
      const stats = fs.statSync(absolute);
      if (stats.size > 0) {
        const ext = path.extname(absolute).toLowerCase();
        compatibleAssets.push({
          id: path.basename(absolute, ext),
          url: absolute,
          type: "image",
          format: ext.replace(".", ""),
          sizeBytes: stats.size,
          tags: ["product", "local"],
          source: "upload",
          verified: true,
          verifiedAt: new Date().toISOString(),
          qualityScore: 0.7,
          usableFor: ["reference", "product-shot"],
        });
      }
    }
  }

  // Check URL assets
  for (const url of productImageUrls) {
    if (url && url.startsWith("http")) {
      compatibleAssets.push({
        id: url.split("/").pop()?.split("?")[0] || "remote-asset",
        url,
        type: "image",
        format: "png",
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
