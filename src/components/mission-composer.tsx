import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Loader2, FolderKanban } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ExecutionPlanDialog } from "@/components/execution-plan-dialog";

const suggestions = [
  "Launch my product",
  "Create YouTube content",
  "Write newsletter",
  "Organize Google Drive",
  "Create social campaign",
];

export function MissionComposer({
  compact = false,
  projectId: fixedProjectId,
}: {
  compact?: boolean;
  projectId?: string;
}) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>(fixedProjectId ?? "none");
  const { createMissionDraft, projects } = useStore();
  const navigate = useNavigate();

  async function submit(text: string) {
    if (!text.trim()) return toast.error("Describe what you want to accomplish");
    setPending(true);
    await new Promise((r) => setTimeout(r, 900));
    const pid = fixedProjectId ?? (selectedProject !== "none" ? selectedProject : undefined);
    const mission = createMissionDraft(text, pid);
    setPending(false);
    setValue("");
    setDraftId(mission.id);
  }

  const showProjectPicker = !fixedProjectId;

  return (
    <>
      <div className={compact ? "" : "space-y-6"}>
        <div className="glass relative overflow-hidden rounded-3xl p-1">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(400px_200px_at_20%_0%,color-mix(in_oklab,var(--color-primary)_60%,transparent),transparent_70%),radial-gradient(400px_200px_at_100%_100%,color-mix(in_oklab,var(--color-secondary)_50%,transparent),transparent_70%)]" />
          <div className="relative flex flex-col gap-3 rounded-[calc(1.5rem-4px)] bg-background/40 p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> New mission
              </label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(value);
                }}
                rows={compact ? 2 : 3}
                placeholder="What do you want to accomplish today?"
                className="w-full resize-none bg-transparent text-lg font-medium leading-relaxed outline-none placeholder:text-muted-foreground sm:text-xl"
              />
              {showProjectPicker && projects.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="h-8 w-full max-w-xs rounded-full border-border bg-surface text-xs">
                      <SelectValue placeholder="No project" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card">
                      <SelectItem value="none">No project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button
              onClick={() => submit(value)}
              disabled={pending}
              className="h-12 rounded-full px-6 text-sm font-medium shadow-lg glow-primary"
            >
              {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning</>
              ) : (
                <>Execute Mission <ArrowUpRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>

        {!compact && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-surface hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <ExecutionPlanDialog
        missionId={draftId}
        onClose={() => setDraftId(null)}
        onOpenMission={(id) => {
          setDraftId(null);
          navigate({ to: "/missions/$missionId", params: { missionId: id } });
        }}
      />
    </>
  );
}
