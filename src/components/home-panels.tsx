import { CheckCircle2, Circle, Plug, Sparkles, Rocket, Clock, Coins, ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

type Step = {
  id: string;
  title: string;
  body: string;
  done: boolean;
  to: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function OnboardingChecklist() {
  const { integrations, workspace, missions } = useStore();

  const steps: Step[] = [
    {
      id: "connect",
      title: "Connect your first tool",
      body: "AnchorSpace works inside the apps you already use — Drive, Gmail, Notion, YouTube.",
      done: integrations.some((i) => i.connected),
      to: "/integrations",
      cta: "Connect apps",
      icon: Plug,
    },
    {
      id: "brand",
      title: "Teach it your brand",
      body: "Add your brand name and tone of voice so every output sounds like you.",
      done: Boolean(workspace.brandName?.trim()) && Boolean(workspace.writingTone?.trim()),
      to: "/workspace",
      cta: "Set brand voice",
      icon: Sparkles,
    },
    {
      id: "mission",
      title: "Run your first mission",
      body: "Describe an outcome. You'll approve the plan before anything executes.",
      done: missions.length > 0,
      to: "/missions",
      cta: "View missions",
      icon: Rocket,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <section aria-labelledby="setup-heading" className="panel animate-rise overflow-hidden p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Getting started</p>
          <h2 id="setup-heading" className="mt-1 truncate">
            Set up your workspace
          </h2>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {completed} of {steps.length}
        </p>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-5 grid gap-3 lg:grid-cols-3">
        {steps.map((step) => (
          <li key={step.id} className="panel-inset lift flex flex-col gap-3 p-4">
            <div className="flex items-start gap-3">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${step.done ? "text-muted-foreground line-through" : ""}`}>
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </div>
            {!step.done && (
              <Button asChild variant="secondary" size="sm" className="mt-auto w-full rounded-full">
                <Link to={step.to}>
                  <step.icon className="mr-2 h-4 w-4" />
                  {step.cta}
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatGrid() {
  const { missions, integrations, credits } = useStore();
  const completed = missions.filter((m) => m.status === "completed").length;
  const running = missions.filter((m) => m.status === "running").length;
  const connected = integrations.filter((i) => i.connected).length;

  const stats = [
    { label: "Missions completed", value: completed, icon: CheckCircle2, tone: "text-success" },
    { label: "Running now", value: running, icon: Clock, tone: "text-primary" },
    { label: "Apps connected", value: connected, icon: Plug, tone: "text-secondary" },
    { label: "Credits used", value: credits.used.toLocaleString(), icon: Coins, tone: "text-warning" },
  ];

  return (
    <section aria-label="Workspace overview" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="panel lift p-4 sm:p-5">
          <s.icon className={`h-5 w-5 ${s.tone}`} aria-hidden />
          <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </section>
  );
}

export function UpcomingSchedule() {
  const { events } = useStore();
  const upcoming = [...events]
    .filter((e) => e.date >= Date.now() - 86_400_000)
    .sort((a, b) => a.date - b.date)
    .slice(0, 4);

  return (
    <section aria-labelledby="schedule-heading" className="panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="schedule-heading" className="text-base font-semibold">
          Upcoming
        </h2>
        <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground">
          <Link to="/calendar">
            Calendar <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {upcoming.length === 0 ? (
        <div className="panel-inset mt-4 flex flex-col items-center gap-3 p-8 text-center">
          <CalendarDays className="h-6 w-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {upcoming.map((e) => (
            <li key={e.id} className="panel-inset flex items-center gap-3 p-3">
              <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: e.color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  {e.time ? ` · ${e.time}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
                {e.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
