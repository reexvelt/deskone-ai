import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MissionComposer } from "@/components/mission-composer";
import {
  ArrowLeft, Rocket, FileText, Plug, BookOpen, Users, Clock, CheckCircle2,
  Sparkles, Loader2, Calendar as CalIcon, StickyNote, Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects/$projectId")({
  component: ProjectWorkspace,
});

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const { projects, missions, knowledge, integrations, events, updateProject } = useStore();
  const project = projects.find((p) => p.id === projectId);

  const projectMissions = useMemo(() => missions.filter((m) => m.projectId === projectId), [missions, projectId]);

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8">
        <div className="text-lg font-semibold">Project not found</div>
        <Link to="/projects" className="mt-3 inline-block text-sm text-primary hover:underline">Back to projects</Link>
      </div>
    );
  }

  const completed = projectMissions.filter((m) => m.status === "completed").length;
  const running = projectMissions.filter((m) => m.status === "running").length;
  const awaiting = projectMissions.filter((m) => m.status === "awaiting_approval").length;
  const totalCost = projectMissions.reduce((s, m) => s + (m.cost ?? 0), 0);
  const projectApps = Array.from(new Set(projectMissions.flatMap((m) => m.apps).concat(project.apps)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <Card className="relative overflow-hidden border-border bg-card p-0">
        <div className="relative h-40" style={{ background: project.cover }}>
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(600px_200px_at_10%_-10%,white,transparent)]" />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">{project.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description || "No description"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {project.members.length} member{project.members.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members.map((m) => (
                <Avatar key={m.id} className="h-8 w-8 border-2 border-card">
                  <AvatarFallback className="bg-primary/20 text-[10px] font-semibold text-primary">
                    {m.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="outline" className="rounded-full border-border bg-surface"><Users className="mr-1 h-4 w-4" /> Invite</Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Rocket} label="Missions" value={String(projectMissions.length)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completed)} accent="var(--color-success)" />
        <StatCard icon={Loader2} label="Running" value={String(running)} accent="var(--color-primary)" />
        <StatCard icon={Sparkles} label="Est. cost" value={`$${totalCost.toFixed(2)}`} />
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="rounded-full border border-border bg-surface p-1">
          {["overview", "missions", "files", "activity", "knowledge", "apps", "notes", "settings"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-full capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <MissionComposer compact />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Recent outputs</div>
                <div className="text-xs text-muted-foreground">{projectMissions.reduce((s, m) => s + m.outputs.length, 0)} total</div>
              </div>
              <div className="space-y-2">
                {projectMissions.flatMap((m) => m.outputs.map((o) => ({ mission: m.title, output: o }))).slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-start justify-between rounded-xl border border-border bg-surface/40 p-3">
                    <div>
                      <div className="text-sm font-medium">{r.output}</div>
                      <div className="text-xs text-muted-foreground">{r.mission}</div>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary/60" />
                  </div>
                ))}
                {projectMissions.every((m) => m.outputs.length === 0) && (
                  <EmptyMini label="Outputs will appear as missions complete." />
                )}
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Upcoming tasks</div>
                <CalIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
                    <div>
                      <div className="text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()} · {e.time}</div>
                    </div>
                    <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="missions" className="mt-6 space-y-4">
          <MissionComposer compact />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {projectMissions.map((m) => (
              <Link key={m.id} to="/missions/$missionId" params={{ missionId: m.id }}>
                <Card className="cursor-pointer border-border bg-card p-5 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{m.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.objective}</div>
                    </div>
                    <Badge className="rounded-full border-0 bg-primary/15 text-primary">{m.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-4">
                    <Progress value={m.progress} className="h-1.5" />
                  </div>
                </Card>
              </Link>
            ))}
            {projectMissions.length === 0 && <EmptyMini label="No missions yet. Start one above." />}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {projectMissions.flatMap((m) => m.files.map((f) => ({ ...f, mission: m.title }))).map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.size} · from {f.mission}</div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full">Open</Button>
              </div>
            ))}
            {projectMissions.every((m) => m.files.length === 0) && (
              <div className="p-8 text-center text-sm text-muted-foreground">No files generated yet.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="relative space-y-4 border-l border-border pl-6">
            {projectMissions.flatMap((m) => m.logs.map((l) => ({ ...l, mission: m.title }))).sort((a, b) => b.ts - a.ts).slice(0, 20).map((a, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[29px] top-1 grid h-4 w-4 place-items-center rounded-full border border-border bg-surface" />
                <div className="text-xs text-muted-foreground">{new Date(a.ts).toLocaleString()} · {a.mission}</div>
                <div className="text-sm">{a.message}</div>
              </div>
            ))}
            {projectMissions.length === 0 && <EmptyMini label="No activity yet." />}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {knowledge.slice(0, 6).map((k) => (
              <Card key={k.id} className="flex items-center gap-3 border-border bg-card p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{k.name}</div>
                  <div className="text-xs text-muted-foreground">{k.size} · used {k.missionUsage}×</div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apps" className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {integrations.filter((i) => projectApps.includes(i.name) || i.connected).map((i) => (
              <Card key={i.id} className="border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">{i.name}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{i.connected ? "Connected" : "Not connected"}</div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card className="border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <StickyNote className="h-4 w-4 text-primary" /> Project notes
            </div>
            <Textarea
              defaultValue={project.notes ?? ""}
              placeholder="Anything DeskOne should remember for this project — audience, tone, constraints…"
              className="min-h-[180px] rounded-xl"
              onBlur={(e) => {
                if (e.target.value !== (project.notes ?? "")) {
                  updateProject(project.id, { notes: e.target.value });
                  toast.success("Notes saved");
                }
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <SettingsIcon className="h-4 w-4 text-primary" /> Project settings
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</label>
                <select
                  defaultValue={project.status}
                  onChange={(e) => { updateProject(project.id, { status: e.target.value as never }); toast.success("Status updated"); }}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: string }) {
  return (
    <Card className="border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground" style={accent ? { color: accent } : undefined}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
    </Card>
  );
}

function EmptyMini({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{label}</div>;
}
