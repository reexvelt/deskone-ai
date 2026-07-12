import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, BookOpen, Link as LinkIcon } from "lucide-react";

export const Route = createFileRoute("/_app/knowledge")({
  component: KnowledgePage,
});

const sources = [
  { id: "1", name: "Brand voice guidelines", type: "doc", size: "48 KB", updated: "2 days ago" },
  { id: "2", name: "Product knowledge base", type: "collection", size: "212 items", updated: "1 week ago" },
  { id: "3", name: "Sales scripts", type: "doc", size: "22 KB", updated: "3 days ago" },
  { id: "4", name: "Company website", type: "url", size: "44 pages", updated: "Today" },
];

function KnowledgePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">Context DeskOne can reference on every mission.</p>
        </div>
        <Button className="rounded-full"><Upload className="mr-1 h-4 w-4" /> Add source</Button>
      </div>

      <Card className="border-dashed border-border bg-surface/40 p-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
        <div className="mt-3 text-sm font-medium">Upload docs, connect URLs, or link a collection</div>
        <div className="mt-1 text-xs text-muted-foreground">DeskOne indexes your knowledge to inform every plan.</div>
      </Card>

      <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {sources.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              {s.type === "url" ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.size} · Updated {s.updated}</div>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full">Manage</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
