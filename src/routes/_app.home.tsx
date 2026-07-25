import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Plus,
  Sparkles,
  SquareTerminal,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

const quickActions = [
  { label: "New Mission", icon: WandSparkles, to: "/missions" },
  { label: "New Project", icon: FolderKanban, to: "/projects" },
  { label: "Upload File", icon: UploadCloud, to: "/studio" },
  { label: "Open Calendar", icon: CalendarDays, to: "/calendar" },
];

const missions = [
  {
    title: "YouTube video launch",
    status: "Running",
    progress: 72,
    time: "Today • 2:30 PM",
  },
  {
    title: "Instagram content pack",
    status: "Awaiting approval",
    progress: 48,
    time: "Today • 5:00 PM",
  },
  {
    title: "Food creator campaign",
    status: "Completed",
    progress: 100,
    time: "Yesterday",
  },
];

const projects = [
  {
    name: "Food Creator Workspace",
    meta: "12 assets • 5 missions",
  },
  {
    name: "Personal Brand Campaign",
    meta: "8 assets • 3 missions",
  },
  {
    name: "Client Content Sprint",
    meta: "19 assets • 7 missions",
  },
];

const connectedApps = [
  "Google Drive",
  "Google Calendar",
  "Gmail",
  "YouTube",
  "Instagram",
  "Notion",
];

function HomePage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            <Sparkles className="h-4 w-4 text-[#7C5CFF]" />
            AnchorSpace Home
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            What do you want to accomplish today?
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
            Manage projects, missions, content, and connected apps from one premium workspace built for creators and freelancers.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[#0B0D12] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3AA7FF]/20">
                <SquareTerminal className="h-5 w-5 text-white/85" />
              </div>

              <div className="w-full">
                <p className="text-sm font-medium text-white/55">Mission Command</p>
                <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/80">
                  Create a food content campaign, generate captions, save assets, and schedule it for Friday.
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3AA7FF] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                    Run Mission <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                    <Plus className="h-4 w-4" />
                    New Mission
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Today</p>
                <h2 className="mt-2 text-xl font-semibold">Workspace overview</h2>
              </div>
              <Clock3 className="h-5 w-5 text-white/50" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                ["Missions", "12 active"],
                ["Projects", "3 in progress"],
                ["Storage", "68% used"],
                ["AI tasks", "26 this week"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p>
                  <p className="mt-2 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#7C5CFF]/15 to-[#3AA7FF]/10 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Next</p>
                <h2 className="mt-2 text-xl font-semibold">Upcoming schedule</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-white/50" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Publish reel draft</p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">
                    Friday
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/50">Scheduled for 6:00 PM</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Client approval review</p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">Today</span>
                </div>
                <p className="mt-2 text-sm text-white/50">Waiting for approval</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Quick actions</p>
            <h2 className="mt-2 text-xl font-semibold">Start a workflow</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0D12] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3AA7FF]/20">
                  <item.icon className="h-5 w-5 text-white/85" />
                </div>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-white/45">Open workflow</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        {/* Missions */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Mission center</p>
              <h2 className="mt-2 text-xl font-semibold">Recent missions</h2>
            </div>
            <Link to="/missions" className="text-sm text-white/55 transition hover:text-white">
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {missions.map((mission) => (
              <div
                key={mission.title}
                className="rounded-2xl border border-white/10 bg-[#0B0D12] p-4 transition hover:border-white/15"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{mission.title}</p>
                    <p className="mt-1 text-sm text-white/45">{mission.time}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60">{mission.status}</span>
                    {mission.status === "Completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#3AA7FF]"
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects + Apps */}
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Projects</p>
                <h2 className="mt-2 text-xl font-semibold">Current workspaces</h2>
              </div>
              <Link to="/projects" className="text-sm text-white/55 transition hover:text-white">
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.name}
                  to="/projects"
                  className="block rounded-2xl border border-white/10 bg-[#0B0D12] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="mt-1 text-sm text-white/45">{project.meta}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/35" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#7C5CFF]/10 to-[#3AA7FF]/10 p-5 backdrop-blur-xl sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Connected apps</p>
            <h2 className="mt-2 text-xl font-semibold">Available in workspace</h2>

            <div className="mt-5 flex flex-wrap gap-2">
              {connectedApps.map((app) => (
                <span
                  key={app}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
