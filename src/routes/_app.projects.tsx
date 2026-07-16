import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, PROJECT_COVERS, type Project } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, FolderKanban, Users, Rocket, Clock, Search, MoreHorizontal, Pencil, Trash2, ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, createProject, updateProject, deleteProject } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(PROJECT_COVERS[0]);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setCover(PROJECT_COVERS[0]);
    setOpen(true);
  }
  function openEdit(p: Project) {
    setEditing(p);
    setName(p.name);
    setDescription(p.description);
    setCover(p.cover);
    setOpen(true);
  }

  function submit() {
    if (!name.trim()) return toast.error("Give your project a name");
    if (editing) {
      updateProject(editing.id, { name, description, cover });
      toast.success("Project updated");
    } else {
      const p = createProject({ name, description, cover });
      toast.success(`Project ${p.name} created`);
    }
    setOpen(false);
  }

  function confirmDelete(p: Project) {
    if (!window.confirm(`Delete project "${p.name}"? Missions inside will be unlinked but not deleted.`)) return;
    deleteProject(p.id);
    toast("Project deleted");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.apps.some((a) => a.toLowerCase().includes(q)),
    );
  }, [projects, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-10 md:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Group related missions into long-running initiatives.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              className="rounded-full border-border bg-surface pl-9"
            />
          </div>
          <Button className="shrink-0 rounded-full glow-primary" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="group relative flex h-full flex-col overflow-hidden border-border bg-card p-0 transition hover:border-primary/40 hover:shadow-[0_20px_60px_-30px_rgba(59,130,246,0.4)]"
          >
            <button
              onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: p.id } })}
              className="relative h-28 w-full overflow-hidden text-left sm:h-32"
              style={{ background: p.cover }}
              aria-label={`Open ${p.name}`}
            >
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(500px_200px_at_20%_0%,white,transparent)] transition group-hover:opacity-50" />
              <div className="absolute right-3 top-3">
                <StatusPill status={p.status} />
              </div>
              <div className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-xl bg-black/30 backdrop-blur-md">
                <FolderKanban className="h-4 w-4 text-white" />
              </div>
            </button>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="min-w-0 flex-1"
                >
                  <div className="truncate text-base font-semibold tracking-tight">{p.name}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-surface hover:text-foreground"
                      aria-label="Project actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 border-border bg-card">
                    <DropdownMenuItem onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: p.id } })}>
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(p)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => confirmDelete(p)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {p.apps.slice(0, 4).map((a) => (
                  <span key={a} className="rounded-full border border-border bg-surface/60 px-2 py-0.5 text-[10px] text-muted-foreground">{a}</span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Rocket className="h-3 w-3" /> {p.missionCount}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {p.members.length}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}

        <button
          onClick={openCreate}
          className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/30 p-6 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">New project</div>
          <div className="text-xs">Group missions around a goal</div>
        </button>
      </div>

      {filtered.length === 0 && query && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects match "{query}".
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "Create project"}</DialogTitle>
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
            <Button onClick={submit} className="rounded-full glow-primary">
              {editing ? "Save changes" : "Create project"}
            </Button>
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
