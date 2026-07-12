import { Check, Loader2, Circle, X, Sparkles, Play, Save, Trophy, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mission } from "@/lib/store";

interface TimelineStage {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ts?: number;
  status: "done" | "active" | "pending" | "failed" | "skipped";
  hint?: string;
}

export function ExecutionTimeline({ mission }: { mission: Mission }) {
  const stages = deriveStages(mission);

  return (
    <ol className="relative space-y-3">
      <div className="absolute bottom-2 left-[19px] top-2 w-px bg-border" aria-hidden />
      {stages.map((s, i) => (
        <li
          key={s.key}
          className="relative flex items-start gap-4 rounded-2xl border border-border/60 bg-surface/40 p-4 opacity-0 [animation:fadeUp_.5s_ease_forwards]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div
            className={cn(
              "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all",
              s.status === "done" && "border-success/40 bg-success/15 text-success",
              s.status === "active" && "border-primary/40 bg-primary/15 text-primary [box-shadow:0_0_0_6px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]",
              s.status === "pending" && "border-border bg-surface text-muted-foreground",
              s.status === "failed" && "border-destructive/50 bg-destructive/15 text-destructive",
              s.status === "skipped" && "border-border bg-surface text-muted-foreground opacity-60",
            )}
          >
            {s.status === "active" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : s.status === "done" ? (
              <Check className="h-4 w-4" />
            ) : s.status === "failed" ? (
              <X className="h-4 w-4" />
            ) : (
              <s.icon className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">{s.label}</div>
              {s.status === "active" && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Now</span>
              )}
            </div>
            {s.hint && <div className="mt-0.5 text-xs text-muted-foreground">{s.hint}</div>}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {s.ts ? new Date(s.ts).toLocaleString() : s.status === "pending" ? "Pending" : "—"}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function deriveStages(m: Mission): TimelineStage[] {
  const doneSteps = m.steps.filter((s) => s.status === "done");
  const runningStep = m.steps.find((s) => s.status === "running");
  const lastStepTs = doneSteps.at(-1)?.completedAt;
  const isDone = m.status === "completed";
  const isFailed = m.status === "failed";
  const isRunning = m.status === "running";
  const isAwaiting = m.status === "awaiting_approval";

  const stages: TimelineStage[] = [
    {
      key: "created", label: "Mission created", icon: Sparkles,
      ts: m.createdAt, status: "done",
      hint: `Objective captured · ~${m.estimatedMinutes}m estimated`,
    },
    {
      key: "understanding", label: "AI understanding request", icon: Sparkles,
      ts: m.createdAt + 800, status: "done",
      hint: "Parsed intent, audience, and constraints",
    },
    {
      key: "planning", label: "Generating plan", icon: Sparkles,
      ts: m.createdAt + 2000, status: "done",
      hint: `${m.steps.length} steps · ${m.apps.length} apps`,
    },
    {
      key: "approval", label: "Waiting for approval", icon: AlertTriangle,
      ts: m.startedAt ?? undefined,
      status: isAwaiting ? "active" : m.startedAt || isDone ? "done" : "pending",
      hint: "Human checkpoint before execution begins",
    },
    {
      key: "executing", label: "Executing", icon: Play,
      ts: m.startedAt,
      status: isFailed ? "failed" : isRunning ? "active" : isDone ? "done" : m.status === "cancelled" ? "skipped" : "pending",
      hint: runningStep ? `Now: ${runningStep.title}` : `${doneSteps.length}/${m.steps.length} steps complete`,
    },
    {
      key: "saving", label: "Saving files", icon: Save,
      ts: isDone ? m.completedAt : lastStepTs,
      status: isDone ? "done" : isRunning && doneSteps.length > 0 ? "active" : "pending",
      hint: `${m.files.length} file${m.files.length === 1 ? "" : "s"} produced`,
    },
    {
      key: "completed", label: "Completed", icon: Trophy,
      ts: m.completedAt,
      status: isDone ? "done" : "pending",
      hint: isDone ? `${m.outputs.length} output${m.outputs.length === 1 ? "" : "s"} delivered` : "Awaiting final steps",
    },
  ];

  return stages;
}
