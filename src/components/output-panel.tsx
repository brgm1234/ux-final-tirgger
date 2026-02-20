"use client";

import { Copy, ExternalLink, Film } from "lucide-react";
import { useState } from "react";

export interface GenerationResult {
  success: boolean;
  videoUrl?: string;
  prompt?: string;
  error?: string;
  output?: Record<string, unknown>;
}

export function OutputPanel({ result }: { result: GenerationResult | null }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-12">
        <Film className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Configure inputs and generate a video to see results here.
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="mb-2 text-sm font-semibold text-destructive">
          Generation Error
        </h3>
        <p className="font-mono text-xs text-destructive/80">
          {result.error}
        </p>
      </div>
    );
  }

  async function handleCopyPrompt() {
    if (result?.prompt) {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Video URL */}
      {result.videoUrl && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">
              Video Ready
            </h3>
            <a
              href={result.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="break-all font-mono text-xs text-muted-foreground">
            {result.videoUrl}
          </p>
        </div>
      )}

      {/* Generated Prompt */}
      {result.prompt && (
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Generated Prompts
            </h3>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
            {result.prompt}
          </pre>
        </div>
      )}

      {/* Raw Output */}
      {result.output && (
        <details className="rounded-lg border border-border bg-card">
          <summary className="cursor-pointer px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            Raw Pipeline Output
          </summary>
          <div className="border-t border-border px-5 py-3">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {JSON.stringify(result.output, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
