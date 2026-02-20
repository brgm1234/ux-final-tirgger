"use client";

import { useState, type FormEvent } from "react";
import { ImageIcon, Sparkles, User } from "lucide-react";

export interface VideoFormData {
  productImageUrl: string;
  avatarImageUrl: string;
  marketingAngle: string;
  options: {
    generatePrompt: boolean;
    generateScript: boolean;
    sendToSora2: boolean;
    enableShotstack: boolean;
  };
}

interface VideoFormProps {
  onSubmit: (data: VideoFormData) => void;
  isLoading: boolean;
}

const PRESET_ANGLES = [
  "Product spotlight",
  "Luxury reveal",
  "Quick demo",
  "Before & after",
  "Unboxing experience",
  "Lifestyle showcase",
];

export function VideoForm({ onSubmit, isLoading }: VideoFormProps) {
  const [productImageUrl, setProductImageUrl] = useState("");
  const [avatarImageUrl, setAvatarImageUrl] = useState("");
  const [marketingAngle, setMarketingAngle] = useState("Product spotlight");
  const [options, setOptions] = useState({
    generatePrompt: true,
    generateScript: true,
    sendToSora2: true,
    enableShotstack: true,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ productImageUrl, avatarImageUrl, marketingAngle, options });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Input Configuration
        </h2>

        {/* Product Image URL */}
        <div className="mb-4">
          <label
            htmlFor="productImageUrl"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <ImageIcon className="h-4 w-4 text-primary" />
            Product Image URL
          </label>
          <input
            id="productImageUrl"
            type="url"
            value={productImageUrl}
            onChange={(e) => setProductImageUrl(e.target.value)}
            placeholder="https://example.com/product.png"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Avatar Image URL */}
        <div className="mb-4">
          <label
            htmlFor="avatarImageUrl"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <User className="h-4 w-4 text-primary" />
            Avatar Image URL
          </label>
          <input
            id="avatarImageUrl"
            type="url"
            value={avatarImageUrl}
            onChange={(e) => setAvatarImageUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Marketing Angle */}
        <div className="mb-4">
          <label
            htmlFor="marketingAngle"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Marketing Angle
          </label>
          <select
            id="marketingAngle"
            value={marketingAngle}
            onChange={(e) => setMarketingAngle(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {PRESET_ANGLES.map((angle) => (
              <option key={angle} value={angle}>
                {angle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Options */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pipeline Options
        </h2>
        <div className="flex flex-col gap-3">
          {(
            [
              ["generatePrompt", "AI Prompt Generation"],
              ["generateScript", "Script Generation"],
              ["sendToSora2", "Sora-2 Video Generation"],
              ["enableShotstack", "Shotstack Assembly"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !productImageUrl || !avatarImageUrl}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Generating...
          </>
        ) : (
          "Generate Video"
        )}
      </button>
    </form>
  );
}
