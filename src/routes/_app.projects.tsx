import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, PROJECT_COVERS } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FolderKanban, Users, Rocket, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, createProject } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(PROJECT_COVERS[0]);

  function submit() {
    if (!name.trim()) return toast.error("Give your project a name");
    const p = createProject({ name, description, cover });
    toast.success(`Project ${p.name} created`);
    setName("");
    setDescription("");
    setCover(PROJECT_COVERS[0]);
    setOpen(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Group related missions into long-running initiatives.</p>
        </div>
        <Button className="rounded-full glow-primary" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }}>
            <Card className="group relative flex h-full flex-col overflow-hidden border-border bg-card p-0 transition hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_rgba(59,130,246,0.4)]">
              <div className="relative h-32 w-full overflow-hidden" style={{ background: p.cover }}>
                <div className="absolute inset-0 opacity-30 [background:radial-gradient(500px_200px_at_20%_0%,white,transparent)] transition group-hover:opacity-50" />
                <div className="absolute right-3 top-3">
                  <StatusPill status={p.status} />
                </div>
                <div className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-xl bg-black/30 backdrop-blur-md">
                  <FolderKanban className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="text-base font-semibold tracking-tight">{p.name}</div>
                <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {p.apps.slice(0, 4).map((a) => (
                    <span key={a} className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">{a}</span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Rocket className="h-3 w-3" /> {p.missionCount} missions</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {p.members.length}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(p.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/30 p-6 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">New project</div>
          <div className="text-xs">Group missions around a goal</div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Projects organize missions, files, and knowledge around one initiative.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ebook Launch" className="rounded-xl" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" className="rounded-xl" rows={3} />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Cover</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COVERS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCover(c)}
                    className={`h-12 w-20 rounded-xl border-2 transition ${cover === c ? "border-primary" : "border-transparent"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={submit} className="rounded-full glow-primary">Create project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-success/20 text-success" },
    paused: { label: "Paused", className: "bg-warning/20 text-warning" },
    archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
    completed: { label: "Completed", className: "bg-primary/20 text-primary" },
  };
  const s = map[status] ?? map.active;
  return <Badge className={`rounded-full border-0 backdrop-blur-md ${s.className}`}>{s.label}</Badge>;
}
