import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Clock, Cpu, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function ExecutionPlanDialog({
  missionId,
  onClose,
  onOpenMission,
}: {
  missionId: string | null;
  onClose: () => void;
  onOpenMission: (id: string) => void;
}) {
  const { missions, approveMission, cancelMission } = useStore();
  const mission = missions.find((m) => m.id === missionId) ?? null;
  const navigate = useNavigate();

  return (
    <Dialog open={!!mission} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden border-border bg-card p-0">
        {mission && (
          <>
            <div className="border-b border-border bg-surface/40 px-6 py-5">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Execution plan</div>
              <DialogHeader>
                <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight">
                  {mission.title}
                </DialogTitle>
              </DialogHeader>
              <p className="mt-2 text-sm text-muted-foreground">{mission.objective}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
              <Stat icon={Clock} label="Estimated time" value={`${mission.estimatedMinutes} min`} />
              <Stat icon={Cpu} label="Apps required" value={`${mission.apps.length}`} />
              <Stat icon={CheckCircle2} label="Steps" value={`${mission.steps.length}`} />
            </div>

            <div className="max-h-[320px] overflow-y-auto border-t border-border px-6 py-5">
              <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Execution steps</div>
              <ol className="space-y-3">
                {mission.steps.map((s, i) => (
                  <li key={s.id} className="flex gap-4 rounded-xl border border-border bg-surface/50 p-4">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium">{s.title}</div>
                        {s.app && (
                          <Badge variant="outline" className="border-border bg-background/60 text-[10px] font-normal text-muted-foreground">
                            {s.app}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {mission.apps.map((a) => (
                  <Badge key={a} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
                    {a}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    cancelMission(mission.id);
                    toast("Mission cancelled");
                    onClose();
                  }}
                  className="rounded-full"
                >
                  <X className="mr-1 h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={() => {
                    approveMission(mission.id);
                    toast.success("Mission approved. Execution started.");
                    onOpenMission(mission.id);
                    navigate({ to: "/missions/$missionId", params: { missionId: mission.id } });
                  }}
                  className="rounded-full px-6 glow-primary"
                >
                  Approve & execute
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}
