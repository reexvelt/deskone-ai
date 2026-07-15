import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload, Video, Mic, Image as ImageIcon, FileText, Check, Loader2, Sparkles,
  Captions, Hash, Type, Share2, CalendarClock, Save, Play, Wand2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/studio")({
  component: StudioPage,
});

type MediaKind = "video" | "voice" | "image" | "note";
interface StudioMedia {
  id: string;
  name: string;
  size: string;
  kind: MediaKind;
  preview?: string;
}

interface StudioStep {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "running" | "done";
  detail?: string;
}

const initialSteps = (): StudioStep[] => [
  { key: "sync", label: "Sync media", icon: Upload, status: "pending" },
  { key: "subs", label: "Generate subtitles", icon: Captions, status: "pending" },
  { key: "caps", label: "Generate captions", icon: Type, status: "pending" },
  { key: "head", label: "Generate headlines", icon: Sparkles, status: "pending" },
  { key: "tags", label: "Generate hashtags", icon: Hash, status: "pending" },
  { key: "desc", label: "Generate descriptions", icon: FileText, status: "pending" },
  { key: "vars", label: "Create platform variations", icon: Share2, status: "pending" },
  { key: "sched", label: "Schedule publishing", icon: CalendarClock, status: "pending" },
  { key: "save", label: "Save outputs", icon: Save, status: "pending" },
];

const PLATFORMS = ["YouTube", "Instagram", "TikTok", "LinkedIn", "X", "Facebook"];

function kindFromFile(f: File): MediaKind {
  if (f.type.startsWith("video/")) return "video";
  if (f.type.startsWith("audio/")) return "voice";
  if (f.type.startsWith("image/")) return "image";
  return "note";
}
function iconFor(k: MediaKind) {
  return k === "video" ? Video : k === "voice" ? Mic : k === "image" ? ImageIcon : FileText;
}
function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function StudioPage() {
  const [media, setMedia] = useState<StudioMedia[]>([]);
  const [steps, setSteps] = useState<StudioStep[]>(initialSteps());
  const [running, setRunning] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>(["YouTube", "Instagram", "TikTok"]);
  const [outputs, setOutputs] = useState<{ label: string; body: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / steps.length) * 100);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).map<StudioMedia>((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: fmtSize(f.size),
      kind: kindFromFile(f),
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setMedia((m) => [...arr, ...m]);
  }

  function removeMedia(id: string) {
    setMedia((m) => m.filter((x) => x.id !== id));
  }

  async function runWorkflow() {
    if (!media.length) return toast.error("Add at least one media asset first");
    setRunning(true);
    setOutputs([]);
    setSteps(initialSteps());
    for (let i = 0; i < initialSteps().length; i++) {
      setSteps((ss) => ss.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
      setSteps((ss) => ss.map((s, idx) => (idx === i ? { ...s, status: "done", detail: outputFor(ss[i].key, media, platforms).summary } : s)));
      setOutputs((prev) => {
        const gen = outputFor(steps[i]?.key ?? initialSteps()[i].key, media, platforms);
        return gen.output ? [...prev, gen.output] : prev;
      });
    }
    setRunning(false);
    toast.success("Content studio workflow completed");
  }

  function togglePlatform(p: string) {
    setPlatforms((xs) => (xs.includes(p) ? xs.filter((x) => x !== p) : [...xs, p]));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 md:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">Content studio</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gradient sm:text-4xl">
            Turn raw media into publish-ready content
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Drop videos, voice notes, images or scripts. DeskOne generates subtitles, captions,
            hashtags and platform-native variations, then schedules them for publishing.
          </p>
        </div>
        <Button
          onClick={runWorkflow}
          disabled={running}
          className="h-11 rounded-full px-6 shadow-lg glow-primary"
        >
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running</> : <><Wand2 className="mr-2 h-4 w-4" /> Run workflow</>}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Left column: media + platforms */}
        <div className="space-y-6">
          <Card
            className="border-border bg-card p-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Media</div>
                <div className="text-xs text-muted-foreground">Drop files or click to upload</div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-border bg-surface" onClick={() => inputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
              <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} accept="video/*,audio/*,image/*,.txt,.md" />
            </div>

            {media.length === 0 ? (
              <div className="mt-5 grid place-items-center rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-medium">Drop videos, voice notes, images or scripts</div>
                <div className="mt-1 text-xs text-muted-foreground">MP4, MOV, MP3, WAV, PNG, JPG, TXT — up to 2GB per file</div>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {media.map((m) => {
                  const Icon = iconFor(m.kind);
                  return (
                    <div key={m.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                        {m.preview ? <img src={m.preview} alt="" className="h-full w-full object-cover" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{m.kind} · {m.size}</div>
                      </div>
                      <button onClick={() => removeMedia(m.id)} className="opacity-0 transition group-hover:opacity-100">
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="text-sm font-semibold">Platforms</div>
            <div className="mt-1 text-xs text-muted-foreground">Choose where variations should be generated for.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = platforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Card>

          {outputs.length > 0 && (
            <Card className="border-border bg-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">Generated outputs</div>
                <Badge className="rounded-full border-0 bg-success/15 text-success">{outputs.length} ready</Badge>
              </div>
              <div className="space-y-3">
                {outputs.map((o, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-surface/60 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{o.label}</div>
                    <div className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{o.body}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: workflow */}
        <div className="space-y-6">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Workflow</div>
              <div className="text-xs text-muted-foreground">{doneCount}/{steps.length} steps</div>
            </div>
            <Progress value={progress} className="mt-3 h-1.5" />
            <ol className="mt-5 space-y-2">
              {steps.map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3.5 transition",
                    s.status === "done" && "border-success/30 bg-success/5",
                    s.status === "running" && "border-primary/40 bg-primary/10",
                    s.status === "pending" && "border-border bg-surface/40",
                  )}
                >
                  <div className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition",
                    s.status === "done" && "border-success/40 bg-success/15 text-success",
                    s.status === "running" && "border-primary/40 bg-primary/15 text-primary",
                    s.status === "pending" && "border-border bg-surface text-muted-foreground",
                  )}>
                    {s.status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : s.status === "done" ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-sm font-medium">{s.label}</div>
                    {s.detail && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{s.detail}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="text-sm font-semibold">What DeskOne will do</div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Play className="h-3.5 w-3.5 text-primary" /> Transcribe and align subtitles per language.</li>
              <li className="flex items-center gap-2"><Play className="h-3.5 w-3.5 text-primary" /> Craft platform-native captions, headlines and hashtags.</li>
              <li className="flex items-center gap-2"><Play className="h-3.5 w-3.5 text-primary" /> Adapt aspect ratios and length per platform.</li>
              <li className="flex items-center gap-2"><Play className="h-3.5 w-3.5 text-primary" /> Queue and schedule publishing across connected apps.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function outputFor(
  key: string,
  media: StudioMedia[],
  platforms: string[],
): { summary: string; output?: { label: string; body: string } } {
  const first = media[0]?.name ?? "your content";
  switch (key) {
    case "sync":
      return { summary: `${media.length} asset${media.length === 1 ? "" : "s"} synced` };
    case "subs":
      return {
        summary: "SRT + VTT generated",
        output: { label: "Subtitles preview", body: "00:00 — Welcome back to the channel.\n00:04 — Today we're going deep on execution.\n00:09 — Let's get into it." },
      };
    case "caps":
      return {
        summary: "3 caption drafts",
        output: { label: "Caption", body: `Not another AI tool. An execution engine.\n\nWatch how ${first.replace(/\.[^.]+$/, "")} went from idea to shipped in one afternoon. Save this if you're building.` },
      };
    case "head":
      return {
        summary: "5 headlines ranked by CTR",
        output: { label: "Headlines", body: "1. The end of chatting with AI\n2. I let DeskOne run my launch — here's what happened\n3. From prompt to production in 22 minutes\n4. This is what execution actually looks like\n5. Stop chatting. Start shipping." },
      };
    case "tags":
      return {
        summary: "Hashtag sets per platform",
        output: { label: "Hashtags", body: "#AItools #Productivity #Automation #ContentCreator #BuildInPublic #SaaS #Founders" },
      };
    case "desc":
      return {
        summary: "Long-form description",
        output: { label: "Description", body: "DeskOne is an AI execution platform. Instead of chatting, you set missions and watch them ship — connected to the tools you already use. In this video I run a full product launch from a single prompt." },
      };
    case "vars":
      return {
        summary: `Variations for ${platforms.join(", ")}`,
        output: { label: "Platform variations", body: platforms.map((p) => `• ${p} — tuned length, aspect ratio and CTA.`).join("\n") },
      };
    case "sched":
      return {
        summary: "Publishing queued",
        output: { label: "Schedule", body: platforms.map((p, i) => `${p} — ${new Date(Date.now() + (i + 1) * 86400000).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" })}`).join("\n") },
      };
    case "save":
      return { summary: "Saved to project workspace" };
    default:
      return { summary: "" };
  }
}
