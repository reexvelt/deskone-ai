import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";

export const Route = createFileRoute("/_app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects } = useStore();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Group related missions into long-running initiatives.</p>
        </div>
        <Button className="rounded-full glow-primary"><Plus className="mr-1 h-4 w-4" /> New project</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="group relative overflow-hidden border-border bg-card p-6 transition hover:border-primary/40">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition group-hover:opacity-40"
              style={{ background: p.color }}
            />
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `linear-gradient(135deg, ${p.color}, transparent)` }}>
                <FolderKanban className="h-5 w-5 text-white/90" />
              </div>
              <div className="mt-4 text-lg font-semibold tracking-tight">{p.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{p.description}</div>
              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.missionCount} missions</span>
                <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
