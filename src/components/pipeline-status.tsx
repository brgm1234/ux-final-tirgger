"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type StepStatus = "idle" | "running" | "done" | "error";

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
}

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/40" />;
  }
}

export function PipelineStatus({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Pipeline Status
      </h2>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <StatusIcon status={step.status} />
              {i < steps.length - 1 && (
                <div
                  className={`mt-1 h-6 w-px ${
                    step.status === "done"
                      ? "bg-primary/40"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="-mt-0.5">
              <p
                className={`text-sm font-medium ${
                  step.status === "running"
                    ? "text-primary"
                    : step.status === "done"
                    ? "text-foreground"
                    : step.status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
