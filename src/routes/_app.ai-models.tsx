import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Zap, Palette, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/ai-models")({
  component: ModelsPage,
});

const iconMap = {
  reasoning: Sparkles,
  fast: Zap,
  creative: Palette,
  vision: Eye,
};

function ModelsPage() {
  const { models, toggleModel } = useStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">AI Models</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick which models DeskOne can route missions through.
        </p>
      </div>

      <div className="space-y-3">
        {models.map((m) => {
          const Icon = iconMap[m.tag];
          return (
            <Card key={m.id} className="flex items-center gap-4 border-border bg-card p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-secondary/25 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.tag}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{m.provider} · {m.description}</div>
              </div>
              <Switch checked={m.enabled} onCheckedChange={() => toggleModel(m.id)} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
