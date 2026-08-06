import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Rocket, FolderKanban } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { MissionComposer } from "@/components/mission-composer";
import { OnboardingChecklist, StatGrid, UpcomingSchedule } from "@/components/home-panels";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/home")({
  head: () => ({
    meta: [
      { title: "Home · AnchorSpace AI Execution Workspace" },
      {
        name: "description",
        content:
          "Your AnchorSpace command center: launch missions, track running work, and see every connected app in one premium workspace.",
      },
      { property: "og:title", content: "Home · AnchorSpace AI Execution Workspace" },
      {
        property: "og:description",
        content: "Launch missions, track progress, and orchestrate your connected marketing tools from one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const statusTone: Record<string, string> = {
  completed: "text-success",
  running: "text-primary",
  awaiting_approval: "text-warning",
  failed: "text-destructive",
  planning: "text-muted-foreground",
  cancelled: "text-muted-foreground",
};

function HomePage() {
  const { user } = useAuth();
  const { missions, projects } = useStore();
  const firstName = (user?.name ?? "there").split(" ")[0];
  const recentMissions = [...missions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const recentProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
  const hasWork = missions.length > 0 || projects.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 sm:space-y-10">
      <header className="animate-rise space-y-3">
        <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="text-gradient">
          {greeting()}, {firstName}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Describe the outcome you want. AnchorSpace builds the plan, you approve it, and your connected tools do the work.
        </p>
      </header>

      <MissionComposer />

      <OnboardingChecklist />

      {/* A brand-new workspace stays calm: dashboards appear once there's real work. */}
      {hasWork && (
        <>
          <StatGrid />

          <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="recent-missions" className="panel p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-missions" className="text-base font-semibold">
              Recent missions
            </h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground">
              <Link to="/missions">
                All missions <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {recentMissions.length === 0 ? (
            <div className="panel-inset mt-4 flex flex-col items-center gap-3 p-10 text-center">
              <Rocket className="h-6 w-6 text-muted-foreground" aria-hidden />
              <div>
                <p className="text-sm font-medium">No missions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try “Write this week's newsletter” in the box above.
                </p>
              </div>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentMissions.map((m) => (
                <li key={m.id}>
                  <Link
                    to="/missions/$missionId"
                    params={{ missionId: m.id }}
                    className="panel-inset lift flex items-center gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        <span className={statusTone[m.status] ?? "text-muted-foreground"}>
                          {m.status.replace("_", " ")}
                        </span>
                        {" · "}
                        {m.apps.slice(0, 3).join(", ") || "No apps yet"}
                      </p>
                      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted" role="presentation">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      {m.progress}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <UpcomingSchedule />
      </div>

      <section aria-labelledby="recent-projects" className="panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="recent-projects" className="text-base font-semibold">
            Active projects
          </h2>
          <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground">
            <Link to="/projects">
              All projects <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="panel-inset mt-4 flex flex-col items-center gap-3 p-10 text-center">
            <FolderKanban className="h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Group related missions into a project to keep work together.</p>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/projects">Create a project</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {recentProjects.map((p) => (
              <li key={p.id}>
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="panel-inset lift block overflow-hidden"
                >
                  <span className="block h-20 w-full" style={{ background: p.cover }} aria-hidden />
                  <span className="block p-4">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {p.missionCount} mission{p.missionCount === 1 ? "" : "s"} · {p.status}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
        </>
      )}
    </div>
  );
}
