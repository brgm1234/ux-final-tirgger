/**
 * Type definitions for product identity and logic blueprints.
 */

export interface ProductTruth {
  object_form: string[];
  materials: string[];
  colors: string[];
  visible_parts: string[];
  visual_constraints: string[];
}

export interface MarketInsight {
  hooks: string[];
  ctaStyles: string[];
  visualPatterns: string[];
  engagementSignals: string[];
}

export interface ProductMatch {
  compatibleAssets: VerifiedAsset[];
  logicReuseAllowed: boolean;
  justification: string;
}

export interface VerifiedAsset {
  id: string;
  url: string;
  type: "image" | "video" | "audio";
  tags: string[];
}

export interface ProductIdentity {
  name: string;
  description?: string;
  features?: string[];
  imageUrl?: string;
  imageBase64?: string;
  truth: ProductTruth;
}

export interface LogicBlueprint {
  product: ProductIdentity;
  market: MarketInsight;
  match: ProductMatch;
  generatedAt: string;
}
