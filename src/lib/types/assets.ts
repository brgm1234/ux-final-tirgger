/**
 * Type definitions for visual and verified assets.
 */

export interface VisualAsset {
  id: string;
  url: string;
  type: "image" | "video" | "audio";
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  sizeBytes?: number;
  tags: string[];
  source: "upload" | "generated" | "scraped" | "stock";
}

export interface VerifiedAsset extends VisualAsset {
  verified: true;
  verifiedAt: string;
  qualityScore: number;
  usableFor: ("reference" | "overlay" | "background" | "product-shot")[];
}

export interface AssetCollection {
  assets: VerifiedAsset[];
  totalCount: number;
  fetchedAt: string;
}
