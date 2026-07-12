import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ExecutionTimeline } from "@/components/execution-timeline";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, CheckCircle2, Circle, Clock, Cpu, FileText, Loader2, Play, X,
  MoreHorizontal, RotateCw, Copy, Trash2, DollarSign, Timer,
} from "lucide-react";

export const Route = createFileRoute("/_app/missions/$missionId")({
  component: MissionDetail,
});

function MissionDetail() {
  const { missionId } = Route.useParams();
  const { missions, approveMission, cancelMission, retryMission, duplicateMission, deleteMission } = useStore();
  const navigate = useNavigate();
  const mission = missions.find((m) => m.id === missionId);

  if (!mission) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
        <div className="text-lg font-semibold">Mission not found</div>
        <Link to="/missions" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to missions
        </Link>
      </div>
    );
  }

  const awaiting = mission.status === "awaiting_approval";
  const durationMs = mission.completedAt && mission.startedAt
    ? mission.completedAt - mission.startedAt
    : mission.startedAt
      ? Date.now() - mission.startedAt
      : 0;
  const durationLabel = durationMs > 0
    ? durationMs < 60000
      ? `${Math.round(durationMs / 1000)}s`
      : `${Math.round(durationMs / 60000)}m`
    : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Link to="/missions" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All missions
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mission</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{mission.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{mission.objective}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={mission.status} />
          {awaiting ? (
            <>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => { cancelMission(mission.id); toast("Mission cancelled"); }}
              >
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button
                className="rounded-full glow-primary"
                onClick={() => { approveMission(mission.id); toast.success("Mission approved. Execution started."); }}
              >
                <Play className="mr-1 h-4 w-4" /> Approve & execute
              </Button>
            </>
          ) : mission.status === "running" ? (
            <Button variant="outline" className="rounded-full border-border bg-surface">
              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Running
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-border bg-card">
              <DropdownMenuItem
                onClick={() => { retryMission(mission.id); toast.success("Mission retried"); }}
                disabled={mission.status === "running" || mission.status === "awaiting_approval"}
              >
                <RotateCw className="mr-2 h-4 w-4" /> Retry mission
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const copy = duplicateMission(mission.id);
                if (copy) { toast.success("Duplicated"); navigate({ to: "/missions/$missionId", params: { missionId: copy.id } }); }
              }}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { deleteMission(mission.id); toast("Mission deleted"); navigate({ to: "/missions" }); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetaCard icon={Clock} label="Estimated" value={`${mission.estimatedMinutes} min`} />
        <MetaCard icon={Timer} label="Duration" value={durationLabel} />
        <MetaCard icon={Cpu} label="Apps" value={`${mission.apps.length}`} />
        <MetaCard icon={FileText} label="Files" value={`${mission.files.length}`} />
        <MetaCard icon={DollarSign} label="Cost" value={`$${(mission.cost ?? 0).toFixed(2)}`} />
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span>{mission.progress}%</span>
        </div>
        <Progress value={mission.progress} className="h-1.5" />
      </div>

      <Tabs defaultValue="overview" className="mt-10">
        <TabsList className="rounded-full border border-border bg-surface p-1">
          {["overview", "plan", "timeline", "outputs", "apps", "files", "logs"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-full capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="border-border bg-card p-6">
            <div className="text-sm font-semibold">Mission objective</div>
            <p className="mt-2 text-sm text-muted-foreground">{mission.objective}</p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Connected apps</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mission.apps.map((a) => (
                    <Badge key={a} className="rounded-full border-0 bg-primary/10 text-primary">{a}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Outputs</div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {mission.outputs.length === 0 ? "No outputs yet." : mission.outputs.map((o) => <div key={o}>· {o}</div>)}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <ol className="space-y-3">
            {mission.steps.map((s, i) => (
              <li key={s.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium">{s.title}</div>
                    {s.app && <Badge variant="outline" className="border-border">{s.app}</Badge>}
                    <StepStatus status={s.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <div className="relative space-y-6 border-l border-border pl-6">
            {mission.steps.map((s, i) => (
              <div key={s.id} className="relative">
                <span className={`absolute -left-[29px] top-1 grid h-4 w-4 place-items-center rounded-full border border-border ${s.status === "done" ? "bg-success" : s.status === "running" ? "bg-primary" : "bg-surface"}`} />
                <div className="text-xs text-muted-foreground">Step {i + 1} · {s.app ?? "AI"}</div>
                <div className="text-sm font-medium">{s.title}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outputs" className="mt-6">
          {mission.outputs.length === 0 ? (
            <EmptyState label="Outputs will appear here as the mission progresses." />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {mission.outputs.map((o) => (
                <Card key={o} className="border-border bg-card p-4">
                  <div className="text-sm font-medium">{o}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Ready to review</div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="apps" className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {mission.apps.map((a) => (
              <Card key={a} className="border-border bg-card p-4">
                <div className="text-sm font-medium">{a}</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          {mission.files.length === 0 ? (
            <EmptyState label="No files generated yet." />
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {mission.files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-4">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.size} · {f.kind}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full">Download</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <div className="rounded-2xl border border-border bg-black/30 p-4 font-mono text-xs">
            {mission.logs.map((l, i) => (
              <div key={i} className="flex gap-3 py-1">
                <span className="text-muted-foreground">{new Date(l.ts).toLocaleTimeString()}</span>
                <span className={levelColor(l.level)}>{l.level.toUpperCase()}</span>
                <span className="text-foreground/90">{l.message}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function levelColor(lvl: string) {
  switch (lvl) {
    case "success": return "text-success";
    case "warn": return "text-warning";
    case "error": return "text-destructive";
    default: return "text-primary";
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border p-14 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight">{value}</div>
    </Card>
  );
}

function StepStatus({ status }: { status: string }) {
  if (status === "done") return <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Done</span>;
  if (status === "running") return <span className="inline-flex items-center gap-1 text-xs text-primary"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running</span>;
  if (status === "failed") return <span className="inline-flex items-center gap-1 text-xs text-destructive"><X className="h-3.5 w-3.5" /> Failed</span>;
  return <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Circle className="h-3 w-3" /> Pending</span>;
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
  return <Badge className={`rounded-full border-0 ${s.className}`}>{s.label}</Badge>;
}
