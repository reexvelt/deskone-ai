import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type MissionStatus } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MissionComposer } from "@/components/mission-composer";
import { Search, Rocket } from "lucide-react";

export const Route = createFileRoute("/_app/missions")({
  component: MissionsPage,
});

const filters: { id: "all" | MissionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "running", label: "Running" },
  { id: "awaiting_approval", label: "Awaiting approval" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function MissionsPage() {
  const { missions } = useStore();
  const [filter, setFilter] = useState<"all" | MissionStatus>("all");
  const [query, setQuery] = useState("");

  const filtered = missions
    .filter((m) => (filter === "all" ? true : m.status === filter))
    .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Missions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every outcome you've asked DeskOne to execute.</p>
        </div>
      </div>

      <MissionComposer compact />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <Button
              key={f.id}
              variant={filter === f.id ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${filter === f.id ? "" : "text-muted-foreground"}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search missions"
            className="rounded-full border-border bg-surface pl-9"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((m) => (
          <Link key={m.id} to="/missions/$missionId" params={{ missionId: m.id }}>
            <Card className="group h-full cursor-pointer border-border bg-card p-5 transition hover:border-primary/40 hover:bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold tracking-tight">{m.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.objective}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{m.progress}%</span>
                </div>
                <Progress value={m.progress} className="h-1.5" />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {m.apps.slice(0, 4).map((a) => (
                    <span key={a} className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {timeAgo(m.startedAt ?? m.createdAt)}
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-16 text-center">
            <Rocket className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">No missions match this filter</div>
            <div className="text-xs text-muted-foreground">Start a new one from the composer above.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    planning: { label: "Planning", className: "bg-muted text-muted-foreground" },
    awaiting_approval: { label: "Awaiting approval", className: "bg-warning/15 text-warning" },
    running: { label: "Running", className: "bg-primary/15 text-primary" },
    completed: { label: "Completed", className: "bg-success/15 text-success" },
    cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
    failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
  };
  const s = map[status] ?? map.planning;
  return <Badge className={`shrink-0 rounded-full border-0 ${s.className}`}>{s.label}</Badge>;
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
