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
  Image as ImageIcon, Video, Music, Captions, ScrollText, Wand2, Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects/$projectId")({
  component: ProjectWorkspace,
});

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "missions", label: "Missions" },
  { key: "timeline", label: "Timeline" },
  { key: "media", label: "Media" },
  { key: "content", label: "Content" },
  { key: "files", label: "Files" },
  { key: "notes", label: "Notes" },
  { key: "knowledge", label: "Knowledge" },
  { key: "apps", label: "Apps" },
  { key: "settings", label: "Settings" },
] as const;

const MEDIA_EXT = /\.(mp4|mov|webm|mp3|wav|m4a|png|jpe?g|gif|webp|svg)$/i;

function mediaKind(name: string, kind: string): "video" | "audio" | "image" | "doc" {
  const lower = name.toLowerCase();
  if (/\.(mp4|mov|webm)$/.test(lower) || kind === "video") return "video";
  if (/\.(mp3|wav|m4a|ogg)$/.test(lower) || kind === "audio") return "audio";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower) || kind === "image") return "image";
  return "doc";
}

function contentBucket(text: string): "caption" | "script" | "headline" | "hashtag" | "description" | "generated" {
  const t = text.toLowerCase();
  if (t.includes("caption")) return "caption";
  if (t.includes("script")) return "script";
  if (t.includes("headline") || t.includes("title")) return "headline";
  if (t.includes("hashtag") || t.includes("tag")) return "hashtag";
  if (t.includes("description") || t.includes("copy") || t.includes("narrative")) return "description";
  return "generated";
}

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const { projects, missions, knowledge, integrations, events, assets, updateProject, approveAsset, deleteAsset } = useStore();
  const project = projects.find((p) => p.id === projectId);

  const projectMissions = useMemo(() => missions.filter((m) => m.projectId === projectId), [missions, projectId]);
  const projectAssets = useMemo(() => assets.filter((a) => a.projectId === projectId), [assets, projectId]);


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
  const totalCost = projectMissions.reduce((s, m) => s + (m.cost ?? 0), 0);
  const projectApps = Array.from(new Set(projectMissions.flatMap((m) => m.apps).concat(project.apps)));

  const allFiles = projectMissions.flatMap((m) => m.files.map((f) => ({ ...f, mission: m.title, missionId: m.id })));
  const mediaFiles = allFiles.filter((f) => MEDIA_EXT.test(f.name) || ["video", "audio", "image"].includes(f.kind));
  const docFiles = allFiles.filter((f) => !mediaFiles.includes(f));

  const allOutputs = projectMissions.flatMap((m) =>
    m.outputs.map((o) => ({ text: o, mission: m.title, missionId: m.id, ts: m.completedAt ?? m.startedAt ?? m.createdAt })),
  );
  const byBucket = {
    caption: allOutputs.filter((o) => contentBucket(o.text) === "caption"),
    script: allOutputs.filter((o) => contentBucket(o.text) === "script"),
    headline: allOutputs.filter((o) => contentBucket(o.text) === "headline"),
    hashtag: allOutputs.filter((o) => contentBucket(o.text) === "hashtag"),
    description: allOutputs.filter((o) => contentBucket(o.text) === "description"),
    generated: allOutputs.filter((o) => contentBucket(o.text) === "generated"),
  };

  const timelineEntries = [
    ...projectMissions.map((m) => ({
      ts: m.createdAt,
      title: `Mission created — ${m.title}`,
      kind: "created" as const,
      missionId: m.id,
    })),
    ...projectMissions
      .filter((m) => m.status === "completed")
      .map((m) => ({
        ts: m.completedAt ?? m.createdAt,
        title: `Completed — ${m.title}`,
        kind: "completed" as const,
        missionId: m.id,
      })),
    ...projectMissions.flatMap((m) =>
      m.logs.slice(-4).map((l) => ({
        ts: l.ts,
        title: `${m.title} · ${l.message}`,
        kind: (l.level ?? "info") as "info" | "success" | "warn",
        missionId: m.id,
      })),
    ),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-8">
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>

      <Card className="relative overflow-hidden border-border bg-card p-0">
        <div className="relative h-28 sm:h-40" style={{ background: project.cover }}>
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(600px_200px_at_10%_-10%,white,transparent)]" />
        </div>
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Project</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gradient sm:text-3xl md:text-4xl">
              {project.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description || "No description"}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
              <span className="hidden sm:inline">·</span>
              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              <span className="hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {project.members.length} member{project.members.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {project.members.map((m) => (
                <Avatar key={m.id} className="h-8 w-8 border-2 border-card">
                  <AvatarFallback className="bg-primary/20 text-[10px] font-semibold text-primary">
                    {m.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="outline" size="sm" className="rounded-full border-border bg-surface">
              <Users className="mr-1 h-4 w-4" /> Invite
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 md:grid-cols-4">
        <StatCard icon={Rocket} label="Missions" value={String(projectMissions.length)} />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completed)} accent="var(--color-success)" />
        <StatCard icon={Loader2} label="Running" value={String(running)} accent="var(--color-primary)" />
        <StatCard icon={Sparkles} label="Est. cost" value={`$${totalCost.toFixed(2)}`} />
      </div>

      <Tabs defaultValue="overview" className="mt-6 sm:mt-8">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="inline-flex w-max rounded-full border border-border bg-surface p-1 sm:w-auto">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.key}
                value={t.key}
                className="rounded-full px-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-4 sm:text-sm"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
          <MissionComposer compact projectId={project.id} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-border bg-card p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Recent outputs</div>
                <div className="text-xs text-muted-foreground">{allOutputs.length} total</div>
              </div>
              <div className="space-y-2">
                {allOutputs.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/40 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.text}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.mission}</div>
                    </div>
                    <Sparkles className="h-4 w-4 shrink-0 text-primary/60" />
                  </div>
                ))}
                {allOutputs.length === 0 && (
                  <EmptyMini label="Outputs will appear as missions complete." />
                )}
              </div>
            </Card>

            <Card className="border-border bg-card p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Upcoming tasks</div>
                <CalIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()} · {e.time}</div>
                    </div>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: e.color }} />
                  </div>
                ))}
                {events.length === 0 && <EmptyMini label="No upcoming tasks." />}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="missions" className="mt-5 space-y-4 sm:mt-6">
          <MissionComposer compact projectId={project.id} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {projectMissions.map((m) => (
              <Link key={m.id} to="/missions/$missionId" params={{ missionId: m.id }}>
                <Card className="cursor-pointer border-border bg-card p-4 transition hover:border-primary/40 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.title}</div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.objective}</div>
                    </div>
                    <Badge className="shrink-0 rounded-full border-0 bg-primary/15 text-[10px] text-primary">
                      {m.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={m.progress} className="h-1.5 flex-1" />
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{m.progress}%</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.apps.slice(0, 3).map((a) => (
                      <span key={a} className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
            {projectMissions.length === 0 && <EmptyMini label="No missions yet. Start one above." />}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-5 sm:mt-6">
          <Card className="border-border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Project timeline</div>
              <div className="text-xs text-muted-foreground">{timelineEntries.length} events</div>
            </div>
            {timelineEntries.length === 0 ? (
              <EmptyMini label="Timeline will populate as missions run." />
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-5 sm:pl-6">
                {timelineEntries.slice(0, 40).map((e, i) => (
                  <li key={i} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[25px] top-1.5 grid h-3 w-3 place-items-center rounded-full border-2 border-background sm:-left-[29px] sm:h-3.5 sm:w-3.5",
                        e.kind === "completed" && "bg-success",
                        e.kind === "created" && "bg-primary",
                        e.kind === "success" && "bg-success",
                        e.kind === "warn" && "bg-warning",
                        e.kind === "info" && "bg-muted-foreground/60",
                      )}
                    />
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {new Date(e.ts).toLocaleString()}
                    </div>
                    <Link
                      to="/missions/$missionId"
                      params={{ missionId: e.missionId }}
                      className="mt-0.5 block text-sm font-medium hover:text-primary"
                    >
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-5 sm:mt-6">
          {mediaFiles.length === 0 ? (
            <EmptyMini label="No media assets yet. Upload media in Content Studio or through a mission." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {mediaFiles.map((f) => {
                const kind = mediaKind(f.name, f.kind);
                const Icon = kind === "video" ? Video : kind === "audio" ? Music : kind === "image" ? ImageIcon : FileText;
                return (
                  <Card key={f.id} className="overflow-hidden border-border bg-card">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-surface to-secondary/20">
                      <div className="absolute inset-0 grid place-items-center">
                        <Icon className="h-8 w-8 text-foreground/70" />
                      </div>
                      <Badge className="absolute left-2 top-2 rounded-full border-0 bg-background/70 text-[10px] capitalize backdrop-blur">
                        {kind}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <div className="truncate text-xs font-medium">{f.name}</div>
                      <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{f.size} · {f.mission}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="mt-5 space-y-5 sm:mt-6">
          {projectAssets.length > 0 && (
            <Card className="border-border bg-card p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" /> Studio assets
                </div>
                <div className="text-xs text-muted-foreground">
                  {projectAssets.filter((a) => a.status === "approved").length} approved · {projectAssets.length} total
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {projectAssets.slice(0, 12).map((a) => (
                  <div key={a.id} className="rounded-xl border border-border bg-surface/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-xs font-semibold capitalize">{a.kind}</div>
                      <Badge className={cn(
                        "rounded-full border-0 text-[10px]",
                        a.status === "approved" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                      )}>
                        {a.status}
                      </Badge>
                    </div>
                    <div className="mt-1 line-clamp-3 text-xs text-muted-foreground">{a.body}</div>
                    <div className="mt-2 flex gap-1.5">
                      {a.status !== "approved" && (
                        <Button size="sm" variant="outline" className="h-7 rounded-full border-border bg-surface px-2.5 text-[11px]" onClick={() => { approveAsset(a.id); toast.success("Approved"); }}>Approve</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 rounded-full px-2.5 text-[11px] text-destructive hover:text-destructive" onClick={() => { deleteAsset(a.id); toast("Deleted"); }}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {allOutputs.length === 0 && projectAssets.length === 0 ? (
            <EmptyMini label="Captions, scripts and generated content will appear here as missions produce them." />
          ) : (
            <>
              <ContentBucket icon={Captions} title="Captions" items={byBucket.caption} accent="var(--color-primary)" />
              <ContentBucket icon={ScrollText} title="Scripts" items={byBucket.script} accent="var(--color-secondary)" />
              <ContentBucket icon={Sparkles} title="Headlines & titles" items={byBucket.headline} accent="var(--color-warning)" />
              <ContentBucket icon={Wand2} title="Hashtags" items={byBucket.hashtag} accent="var(--color-success)" />
              <ContentBucket icon={FileText} title="Descriptions & copy" items={byBucket.description} />
              <ContentBucket icon={Sparkles} title="Other generated content" items={byBucket.generated} />
            </>
          )}
        </TabsContent>


        <TabsContent value="files" className="mt-5 sm:mt-6">
          <Card className="divide-y divide-border overflow-hidden border-border bg-card p-0">
            {docFiles.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No documents generated yet.</div>
            ) : (
              docFiles.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{f.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{f.size} · {f.mission}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-5 sm:mt-6">
          <Card className="border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <StickyNote className="h-4 w-4 text-primary" /> Project notes
            </div>
            <Textarea
              defaultValue={project.notes ?? ""}
              placeholder="Anything AnchorSpace should remember for this project — audience, tone, constraints…"
              className="min-h-[200px] rounded-xl"
              onBlur={(e) => {
                if (e.target.value !== (project.notes ?? "")) {
                  updateProject(project.id, { notes: e.target.value });
                  toast.success("Notes saved");
                }
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-5 sm:mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {knowledge.slice(0, 6).map((k) => (
              <Card key={k.id} className="flex items-center gap-3 border-border bg-card p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{k.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{k.size} · used {k.missionUsage}×</div>
                </div>
              </Card>
            ))}
            {knowledge.length === 0 && <EmptyMini label="No knowledge attached yet." />}
          </div>
        </TabsContent>

        <TabsContent value="apps" className="mt-5 sm:mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {integrations.filter((i) => projectApps.includes(i.name) || i.connected).map((i) => (
              <Card key={i.id} className="border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" />
                  <div className="truncate text-sm font-medium">{i.name}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{i.connected ? "Connected" : "Not connected"}</div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-5 sm:mt-6">
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
    <Card className="border-border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs" style={accent ? { color: accent } : undefined}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{value}</div>
    </Card>
  );
}

function ContentBucket({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: { text: string; mission: string; missionId: string }[];
  accent?: string;
}) {
  if (items.length === 0) return null;
  return (
    <Card className="border-border bg-card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{
              background: `color-mix(in oklab, ${accent ?? "var(--color-primary)"} 18%, transparent)`,
              color: accent ?? "var(--color-primary)",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </div>
        <div className="text-xs text-muted-foreground">{items.length}</div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((o, i) => (
          <Link
            key={i}
            to="/missions/$missionId"
            params={{ missionId: o.missionId }}
            className="block rounded-xl border border-border bg-surface/50 p-3 transition hover:border-primary/40 hover:bg-surface"
          >
            <div className="line-clamp-2 text-sm font-medium">{o.text}</div>
            <div className="mt-1 truncate text-[11px] text-muted-foreground">{o.mission}</div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function EmptyMini({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">{label}</div>;
}
