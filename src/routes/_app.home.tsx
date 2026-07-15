import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { MissionComposer } from "@/components/mission-composer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Plug, Coins, ArrowUpRight, Calendar, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function HomePage() {
  const { user } = useAuth();
  const { missions, projects, integrations, credits } = useStore();

  const running = missions.filter((m) => m.status === "running").length;
  const completed = missions.filter((m) => m.status === "completed").length;
  const connectedApps = integrations.filter((i) => i.connected).length;

  const recentMissions = [...missions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const recentProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-8 md:py-14">
      <div className="mb-8 sm:mb-10">
        <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground sm:text-sm sm:tracking-normal sm:normal-case">{greeting()},</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gradient sm:text-5xl">
          {user?.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Describe an outcome. DeskOne will draft an execution plan and coordinate your apps to make it happen.
        </p>
      </div>

      <MissionComposer />

      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={CheckCircle2} label="Completed missions" value={completed} tint="var(--color-success)" />
        <StatCard icon={Zap} label="Running missions" value={running} tint="var(--color-primary)" />
        <StatCard icon={Plug} label="Connected apps" value={connectedApps} tint="var(--color-secondary)" />
        <StatCard icon={Coins} label="Credits used" value={`${credits.used.toLocaleString()} / ${credits.total.toLocaleString()}`} tint="var(--color-warning)" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Recent missions</CardTitle>
            <Link to="/missions" className="text-xs text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMissions.length === 0 && <div className="text-sm text-muted-foreground">No missions yet.</div>}
            {recentMissions.map((m) => (
              <Link
                key={m.id}
                to="/missions/$missionId"
                params={{ missionId: m.id }}
                className="block rounded-xl border border-border bg-surface/50 p-4 transition hover:border-primary/30 hover:bg-surface"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {m.apps.slice(0, 3).join(" · ")}
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-3">
                  <Progress value={m.progress} className="h-1.5" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-surface/60">
                  <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${p.color}, transparent)` }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.missionCount} missions</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <ScheduleItem title="Weekly content sync" time="Tomorrow · 09:00" />
              <ScheduleItem title="Ebook launch email" time="Fri · 14:00" />
              <ScheduleItem title="Team review" time="Mon · 10:30" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tint: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `color-mix(in oklab, ${tint} 22%, transparent)`, color: tint }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
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
  return <Badge className={`rounded-full border-0 ${s.className}`}>{s.label}</Badge>;
}

function ScheduleItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Clock className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
    </div>
  );
}
