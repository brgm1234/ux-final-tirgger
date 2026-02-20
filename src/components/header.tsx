import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            VidGen Pro
          </h1>
          <p className="text-xs text-muted-foreground">
            AI Video Generation Pipeline
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="/api/health"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          API Health
        </a>
      </div>
    </header>
  );
}
