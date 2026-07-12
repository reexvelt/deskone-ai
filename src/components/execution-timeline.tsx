import type { Mission } from "@/lib/store";
import { CheckCircle2, Circle, Loader2, Sparkles, ClipboardList, ShieldCheck, Play, Save, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  state: "done" | "running" | "pending" | "failed";
  ts?: number;
  hint?: string;
};

function fmtTime(ts?: number) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ExecutionTimeline({ mission }: { mission: Mission }) {
  const cancelled = mission.status === "cancelled";
  const failed = mission.status === "failed";
  const awaiting = mission.status === "awaiting_approval";
  const running = mission.status === "running";
  const done = mission.status === "completed";

  const stepPhases: Phase[] = mission.steps.map((s) => ({
    key: s.id,
    label: s.title,
    icon: Play,
    state: s.status === "done" ? "done" : s.status === "running" ? "running" : s.status === "failed" ? "failed" : "pending",
    ts: s.completedAt,
    hint: s.app,
  }));

  const phases: Phase[] = [
    { key: "created", label: "Mission created", icon: Sparkles, state: "done", ts: mission.createdAt },
    { key: "understanding", label: "AI understanding request", icon: Sparkles, state: "done", ts: mission.createdAt + 800, hint: "Parsed objective and constraints" },
    { key: "planning", label: "Generating execution plan", icon: ClipboardList, state: "done", ts: mission.createdAt + 2400, hint: `${mission.steps.length} steps, ${mission.apps.length} apps` },
    {
      key: "approval",
      label: awaiting ? "Waiting for approval" : "Approved",
      icon: ShieldCheck,
      state: awaiting ? "running" : cancelled ? "failed" : "done",
      ts: mission.startedAt,
    },
    ...(!awaiting
      ? [
          ...stepPhases,
          { key: "save", label: "Saving files & outputs", icon: Save, state: done ? "done" : running ? "pending" : "pending", ts: mission.completedAt } as Phase,
          {
            key: "complete",
            label: done ? "Completed" : failed ? "Failed" : cancelled ? "Cancelled" : "Completion",
            icon: Trophy,
            state: done ? "done" : failed || cancelled ? "failed" : "pending",
            ts: mission.completedAt,
          } as Phase,
        ]
      : []),
  ];

  return (
    <ol className="relative">
      <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border/60 to-transparent" />
      {phases.map((p, i) => {
        const Icon = p.icon;
        const activeRing =
          p.state === "running"
            ? "ring-2 ring-primary/40 shadow-[0_0_0_6px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]"
            : "";
        return (
          <li key={p.key} className="relative flex gap-4 pb-6 last:pb-0" style={{ animation: `fadeUp 0.5s ease ${i * 40}ms both` }}>
            <div
              className={cn(
                "relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all",
                p.state === "done" && "border-success/40 bg-success/15 text-success",
                p.state === "running" && `border-primary/40 bg-primary/15 text-primary ${activeRing}`,
                p.state === "pending" && "border-border bg-surface/60 text-muted-foreground",
                p.state === "failed" && "border-destructive/40 bg-destructive/15 text-destructive",
              )}
            >
              {p.state === "done" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : p.state === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : p.state === "pending" ? (
                <Circle className="h-3 w-3" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-medium">{p.label}</div>
                {p.hint && (
                  <span className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {p.hint}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{fmtTime(p.ts)}</div>
              {p.state === "running" && (
                <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-surface">
                  <span className="block h-full w-1/3 animate-pulse rounded-full bg-primary" />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
