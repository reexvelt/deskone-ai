import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload, Video, Mic, Image as ImageIcon, FileText, Check, Sparkles,
  Wand2, X, ScrollText, Type, Captions, Hash, Megaphone, RotateCw,
  Trash2, Save, Pencil, Loader2, CalendarClock, Send, Plug, FolderKanban,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, generateAssetBody, type AssetKind, type ProjectAsset } from "@/lib/store";

export const Route = createFileRoute("/_app/studio")({
  component: StudioPage,
});

type MediaKind = "video" | "audio" | "image" | "document";
interface StudioMedia {
  id: string;
  name: string;
  size: string;
  kind: MediaKind;
  preview?: string;
  progress: number; // 0..100
  status: "uploading" | "ready";
}

const KIND_META: Record<AssetKind, { label: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = {
  script:      { label: "Script",      icon: ScrollText, accent: "var(--color-secondary)" },
  title:       { label: "Title",       icon: Type,       accent: "var(--color-warning)" },
  description: { label: "Description", icon: FileText,   accent: "var(--color-primary)" },
  caption:     { label: "Caption",     icon: Captions,   accent: "var(--color-primary)" },
  hashtag:     { label: "Hashtags",    icon: Hash,       accent: "var(--color-success)" },
  cta:         { label: "CTA",         icon: Megaphone,  accent: "var(--color-warning)" },
  media:       { label: "Media",       icon: ImageIcon,  accent: "var(--color-primary)" },
};

const GENERATE_ORDER: AssetKind[] = ["script", "title", "description", "caption", "hashtag", "cta"];

const PLATFORMS: { id: string; label: string; integrationId: string }[] = [
  { id: "youtube",   label: "YouTube",   integrationId: "youtube" },
  { id: "instagram", label: "Instagram", integrationId: "instagram" },
  { id: "tiktok",    label: "TikTok",    integrationId: "tiktok" },
  { id: "linkedin",  label: "LinkedIn",  integrationId: "linkedin" },
  { id: "x",         label: "X",         integrationId: "x" },
  { id: "facebook",  label: "Facebook",  integrationId: "facebook" },
];

function kindFromFile(f: File): MediaKind {
  if (f.type.startsWith("video/")) return "video";
  if (f.type.startsWith("audio/")) return "audio";
  if (f.type.startsWith("image/")) return "image";
  return "document";
}
function iconFor(k: MediaKind) {
  return k === "video" ? Video : k === "audio" ? Mic : k === "image" ? ImageIcon : FileText;
}
function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function StudioPage() {
  const {
    projects, missions, integrations, assets,
    createProject, createMissionDraft, assignMissionToProject,
    addAsset, updateAsset, approveAsset, deleteAsset, regenerateAsset, setAssetPublish,
  } = useStore();

  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");
  const [missionId, setMissionId] = useState<string>("");
  const [media, setMedia] = useState<StudioMedia[]>([]);
  const [busy, setBusy] = useState<Record<AssetKind, boolean>>({} as never);
  const [platform, setPlatform] = useState<string>("youtube");
  const inputRef = useRef<HTMLInputElement>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectMissions = useMemo(
    () => missions.filter((m) => m.projectId === projectId),
    [missions, projectId],
  );
  const projectAssets = useMemo(
    () => assets.filter((a) => a.projectId === projectId).sort((a, b) => b.updatedAt - a.updatedAt),
    [assets, projectId],
  );

  const platformInfo = PLATFORMS.find((p) => p.id === platform)!;
  const integration = integrations.find((i) => i.id === platformInfo.integrationId);
  const platformConnected = !!integration?.connected;

  function ensureProject(): string {
    if (projectId) return projectId;
    const p = createProject({ name: "Untitled project", description: "Created from Content Studio" });
    setProjectId(p.id);
    toast.success("Project created");
    return p.id;
  }

  function ensureMission(): string {
    const pid = ensureProject();
    if (missionId) return missionId;
    const title = media[0]?.name?.replace(/\.[^.]+$/, "") ?? "Content workflow";
    const m = createMissionDraft(`Studio · ${title}`, pid);
    setMissionId(m.id);
    toast.success("Mission created");
    return m.id;
  }

  function addFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const arr = Array.from(files).map<StudioMedia>((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: fmtSize(f.size),
      kind: kindFromFile(f),
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      progress: 0,
      status: "uploading",
    }));
    setMedia((m) => [...arr, ...m]);
    // Simulate realistic upload progress
    for (const item of arr) {
      let p = 0;
      const timer = window.setInterval(() => {
        p = Math.min(100, p + 8 + Math.random() * 18);
        setMedia((cur) => cur.map((x) => (x.id === item.id ? { ...x, progress: Math.round(p) } : x)));
        if (p >= 100) {
          window.clearInterval(timer);
          setMedia((cur) => cur.map((x) => (x.id === item.id ? { ...x, status: "ready", progress: 100 } : x)));
          // Auto-create a "media" asset in the project once upload finishes
          const pid = projectId || ensureProject();
          addAsset({
            projectId: pid,
            missionId: missionId || undefined,
            kind: "media",
            title: item.name,
            body: `Uploaded ${item.kind} · ${item.size}`,
            mediaName: item.name,
            mediaKind: item.kind,
          });
        }
      }, 280);
    }
  }

  function removeMedia(id: string) {
    setMedia((m) => m.filter((x) => x.id !== id));
  }

  async function generate(kind: AssetKind) {
    if (!media.length && kind !== "hashtag" && kind !== "cta") {
      return toast.error("Upload media first, or use hashtags/CTA which don't require it");
    }
    const pid = ensureProject();
    const mid = ensureMission();
    setBusy((b) => ({ ...b, [kind]: true }));
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    const subject = media[0]?.name?.replace(/\.[^.]+$/, "") ?? project?.name ?? "your content";
    addAsset({
      projectId: pid,
      missionId: mid,
      kind,
      title: `${KIND_META[kind].label} · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      body: generateAssetBody(kind, subject),
    });
    setBusy((b) => ({ ...b, [kind]: false }));
    toast.success(`${KIND_META[kind].label} generated`);
  }

  async function generateAll() {
    if (!media.length) return toast.error("Upload media first");
    for (const k of GENERATE_ORDER) {
      // eslint-disable-next-line no-await-in-loop
      await generate(k);
    }
  }

  const readyMedia = media.filter((m) => m.status === "ready").length;
  const approvedCount = projectAssets.filter((a) => a.status === "approved").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-10 md:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Content studio</div>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Upload. Generate. Approve. Ship.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Everything you create here is saved into the selected project and mission, and syncs across DeskOne instantly.
          </p>
        </div>
        <Button
          onClick={generateAll}
          disabled={!media.length || GENERATE_ORDER.some((k) => busy[k])}
          className="h-11 rounded-full px-6 shadow-lg glow-primary"
        >
          <Wand2 className="mr-2 h-4 w-4" /> Generate everything
        </Button>
      </div>

      {/* Project + Mission binding */}
      <Card className="border-border bg-card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Project</label>
            <Select
              value={projectId || undefined}
              onValueChange={(v) => { setProjectId(v); setMissionId(""); }}
            >
              <SelectTrigger className="rounded-xl border-border bg-surface">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0">
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mission</label>
            <Select
              value={missionId || undefined}
              onValueChange={(v) => setMissionId(v)}
              disabled={!projectId}
            >
              <SelectTrigger className="rounded-xl border-border bg-surface">
                <SelectValue placeholder={projectId ? "Attach to a mission (optional)" : "Select a project first"} />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {projectMissions.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border bg-surface"
              onClick={() => {
                const pid = ensureProject();
                const m = createMissionDraft(`Studio · ${new Date().toLocaleDateString()}`, pid);
                setMissionId(m.id);
                toast.success("Mission created");
              }}
            >
              <Sparkles className="mr-1 h-4 w-4" /> New mission
            </Button>
            {project && (
              <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                <Button variant="ghost" size="sm" className="rounded-full">
                  Open <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        {project && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <FolderKanban className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{project.name}</span>
            <span>·</span>
            <span>{readyMedia} media uploaded</span>
            <span>·</span>
            <span>{projectAssets.length} assets</span>
            <span>·</span>
            <span className="text-success">{approvedCount} approved</span>
          </div>
        )}
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* Left: uploads + generators */}
        <div className="space-y-5">
          <Card
            className="border-border bg-card p-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">Media</div>
                <div className="truncate text-xs text-muted-foreground">Videos, audio, images, and documents up to 2GB.</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full border-border bg-surface"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                accept="video/*,audio/*,image/*,.txt,.md,.pdf,.doc,.docx"
              />
            </div>

            {media.length === 0 ? (
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center transition hover:border-primary/40 hover:bg-surface/60"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="mt-1 text-sm font-medium">Drop or tap to upload</div>
                <div className="text-xs text-muted-foreground">Video · Audio · Images · Documents</div>
              </button>
            ) : (
              <div className="mt-4 space-y-2">
                {media.map((m) => {
                  const Icon = iconFor(m.kind);
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                        {m.preview ? <img src={m.preview} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate text-sm font-medium">{m.name}</div>
                          <div className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {m.status === "uploading" ? `${m.progress}%` : "Ready"}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{m.kind} · {m.size}</div>
                        <Progress value={m.progress} className={cn("mt-2 h-1", m.status === "ready" && "opacity-40")} />
                      </div>
                      <button
                        onClick={() => removeMedia(m.id)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="border-border bg-card p-5">
            <div className="text-sm font-semibold">Generate</div>
            <div className="mt-1 text-xs text-muted-foreground">Each generation is saved as a draft asset in the project — approve, edit, or regenerate.</div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GENERATE_ORDER.map((k) => {
                const meta = KIND_META[k];
                const Icon = meta.icon;
                const loading = !!busy[k];
                return (
                  <button
                    key={k}
                    onClick={() => generate(k)}
                    disabled={loading}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface/50 p-3 text-left transition hover:border-primary/40 hover:bg-surface disabled:opacity-70"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                      style={{
                        background: `color-mix(in oklab, ${meta.accent} 18%, transparent)`,
                        color: meta.accent,
                      }}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{meta.label}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {loading ? "Generating…" : "Generate"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: assets + publishing */}
        <div className="space-y-5">
          <Card className="border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Generated assets</div>
              <Badge className="rounded-full border-0 bg-primary/15 text-primary">{projectAssets.length}</Badge>
            </div>
            {projectAssets.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center text-xs text-muted-foreground">
                Generated scripts, titles, captions and more will appear here.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {projectAssets.map((a) => (
                  <AssetCard
                    key={a.id}
                    asset={a}
                    onUpdate={(patch) => updateAsset(a.id, patch)}
                    onApprove={() => { approveAsset(a.id); toast.success("Approved & saved to project"); }}
                    onRegenerate={() => { regenerateAsset(a.id); toast.success("Regenerated"); }}
                    onDelete={() => { deleteAsset(a.id); toast("Deleted"); }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Publishing */}
          <Card className="border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Send className="h-4 w-4 text-primary" /> Publishing
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Send approved assets to your channels.</div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const active = p.id === platform;
                const conn = integrations.find((i) => i.id === p.integrationId)?.connected;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                    <span className={cn("h-1.5 w-1.5 rounded-full", conn ? "bg-success" : "bg-muted-foreground/50")} />
                  </button>
                );
              })}
            </div>

            {!platformConnected ? (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{platformInfo.label} not connected</div>
                  <div className="text-xs text-muted-foreground">Connect your account to save drafts, schedule, or publish directly.</div>
                </div>
                <Link to="/integrations">
                  <Button size="sm" className="rounded-full glow-primary">
                    <Plug className="mr-1.5 h-4 w-4" /> Connect account
                  </Button>
                </Link>
              </div>
            ) : (
              <PublishingActions
                platform={platformInfo.label}
                assets={projectAssets.filter((a) => a.status === "approved")}
                onDraft={(a) => { setAssetPublish(a.id, { platform: platformInfo.label, state: "draft" }); toast.success(`Saved as draft on ${platformInfo.label}`); }}
                onSchedule={(a) => {
                  const at = Date.now() + 86400000;
                  setAssetPublish(a.id, { platform: platformInfo.label, state: "scheduled", scheduledAt: at });
                  toast.success(`Scheduled for ${new Date(at).toLocaleDateString()}`);
                }}
                onPublish={(a) => { setAssetPublish(a.id, { platform: platformInfo.label, state: "published", publishedAt: Date.now() }); toast.success(`Published to ${platformInfo.label}`); }}
              />
            )}
          </Card>

          {missionId && (
            <Card className="border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Everything you generate is attached to
              </div>
              <Link to="/missions/$missionId" params={{ missionId }} className="mt-2 block text-sm font-medium hover:text-primary">
                {missions.find((m) => m.id === missionId)?.title ?? "This mission"} <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" />
              </Link>
              {project && (
                <button
                  onClick={() => { assignMissionToProject(missionId, project.id); toast.success("Reassigned to project"); }}
                  className="mt-1 block text-[11px] text-muted-foreground hover:text-foreground"
                >
                  in {project.name}
                </button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetCard({
  asset,
  onUpdate,
  onApprove,
  onRegenerate,
  onDelete,
}: {
  asset: ProjectAsset;
  onUpdate: (patch: Partial<ProjectAsset>) => void;
  onApprove: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(asset.body);
  const meta = KIND_META[asset.kind];
  const Icon = meta.icon;
  const approved = asset.status === "approved";

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition",
      approved ? "border-success/30 bg-success/5" : "border-border bg-surface/50",
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
            style={{
              background: `color-mix(in oklab, ${meta.accent} 18%, transparent)`,
              color: meta.accent,
            }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{meta.label}</div>
            <div className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {approved ? "Approved" : "Draft"}
              {asset.publish?.state && asset.publish.state !== "idle" && ` · ${asset.publish.state} on ${asset.publish.platform}`}
            </div>
          </div>
        </div>
        {approved && <Check className="h-4 w-4 shrink-0 text-success" />}
      </div>

      {editing ? (
        <>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-3 min-h-[120px] rounded-xl"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full" onClick={() => { onUpdate({ body: draft }); setEditing(false); toast.success("Saved"); }}>
              <Save className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setDraft(asset.body); setEditing(false); }}>Cancel</Button>
          </div>
        </>
      ) : (
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{asset.body}</div>
      )}

      {!editing && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {!approved && (
            <Button size="sm" variant="default" className="h-7 rounded-full px-3 text-xs glow-primary" onClick={onApprove}>
              <Check className="mr-1 h-3 w-3" /> Approve
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 rounded-full border-border bg-surface px-3 text-xs" onClick={() => { setDraft(asset.body); setEditing(true); }}>
            <Pencil className="mr-1 h-3 w-3" /> Edit
          </Button>
          <Button size="sm" variant="outline" className="h-7 rounded-full border-border bg-surface px-3 text-xs" onClick={onRegenerate}>
            <RotateCw className="mr-1 h-3 w-3" /> Regenerate
          </Button>
          <Button size="sm" variant="ghost" className="h-7 rounded-full px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onDelete}>
            <Trash2 className="mr-1 h-3 w-3" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}

function PublishingActions({
  platform,
  assets,
  onDraft,
  onSchedule,
  onPublish,
}: {
  platform: string;
  assets: ProjectAsset[];
  onDraft: (a: ProjectAsset) => void;
  onSchedule: (a: ProjectAsset) => void;
  onPublish: (a: ProjectAsset) => void;
}) {
  if (assets.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40 p-5 text-center text-xs text-muted-foreground">
        Approve at least one asset to save a draft, schedule, or publish it to {platform}.
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2">
      {assets.map((a) => (
        <div key={a.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface/50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{KIND_META[a.kind].label}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {a.publish?.state && a.publish.state !== "idle" ? `${a.publish.state}${a.publish.scheduledAt ? ` · ${new Date(a.publish.scheduledAt).toLocaleDateString()}` : ""}` : "Not scheduled"}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="outline" className="h-7 rounded-full border-border bg-surface px-3 text-xs" onClick={() => onDraft(a)}>
              <Save className="mr-1 h-3 w-3" /> Draft
            </Button>
            <Button size="sm" variant="outline" className="h-7 rounded-full border-border bg-surface px-3 text-xs" onClick={() => onSchedule(a)}>
              <CalendarClock className="mr-1 h-3 w-3" /> Schedule
            </Button>
            <Button size="sm" className="h-7 rounded-full px-3 text-xs glow-primary" onClick={() => onPublish(a)}>
              <Send className="mr-1 h-3 w-3" /> Publish
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
