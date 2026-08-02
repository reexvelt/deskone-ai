import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useStore, type KnowledgeFile } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, FileImage, FileSpreadsheet, File, Search, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Center · AnchorSpace" },
      { name: "description", content: "Upload brand documents and references so every mission output stays on-message." },
      { property: "og:title", content: "Knowledge Center · AnchorSpace" },
      { property: "og:description", content: "Upload brand documents and references so every mission output stays on-message." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgePage,
});

function typeFromFilename(name: string): KnowledgeFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  return "text";
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function KnowledgePage() {
  const { knowledge, addKnowledgeFile, removeKnowledgeFile } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => knowledge.filter((k) => k.name.toLowerCase().includes(q.toLowerCase()) || (k.tag ?? "").toLowerCase().includes(q.toLowerCase())),
    [knowledge, q],
  );

  function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    Array.from(files).forEach((f) => {
      addKnowledgeFile({
        name: f.name,
        size: humanSize(f.size),
        type: typeFromFilename(f.name),
        tag: "New",
      });
    });
    toast.success(`Added ${files.length} file${files.length > 1 ? "s" : ""} to knowledge`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">Context AnchorSpace references on every mission.</p>
        </div>
        <Button className="rounded-full glow-primary" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1 h-4 w-4" /> Upload files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.webp,.txt,.md"
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border border-dashed border-border bg-surface/40 p-10 text-center transition hover:border-primary/40 hover:bg-surface/60"
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(400px_140px_at_50%_0%,color-mix(in_oklab,var(--color-primary)_25%,transparent),transparent_70%)]" />
        <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-sm font-medium">Drop PDFs, Word docs, spreadsheets, images, or text files</div>
        <div className="text-xs text-muted-foreground">AnchorSpace indexes each source so missions plan with your context.</div>
      </label>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search knowledge…" className="rounded-full border-border bg-surface pl-9" />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} of {knowledge.length}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtered.map((k) => (
          <Card key={k.id} className="group flex items-center gap-4 border-border bg-card p-4 transition hover:border-primary/40">
            <FilePreview file={k} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-medium">{k.name}</div>
                {k.tag && <Badge className="rounded-full border-0 bg-primary/10 text-[10px] text-primary">{k.tag}</Badge>}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {k.size} · {new Date(k.uploadedAt).toLocaleDateString()} · {k.type.toUpperCase()}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary/70" /> used in {k.missionUsage} mission{k.missionUsage === 1 ? "" : "s"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full opacity-0 transition group-hover:opacity-100"
              onClick={() => { removeKnowledgeFile(k.id); toast("File removed"); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No knowledge matches your search.
          </div>
        )}
      </div>
    </div>
  );
}

function FilePreview({ file }: { file: KnowledgeFile }) {
  const map = {
    pdf: { icon: FileText, tint: "#EF4444" },
    doc: { icon: FileText, tint: "#3B82F6" },
    sheet: { icon: FileSpreadsheet, tint: "#22C55E" },
    image: { icon: FileImage, tint: "#7C5CFF" },
    text: { icon: File, tint: "#94A3B8" },
  } as const;
  const { icon: Icon, tint } = map[file.type];
  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-xl"
      style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)`, color: tint }}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}
