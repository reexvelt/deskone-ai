import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { integrations, toggleIntegration } = useStore();
  const categories = Array.from(new Set(integrations.map((i) => i.category)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect the apps DeskOne can execute across.</p>
      </div>

      {categories.map((cat) => (
        <section key={cat} className="mb-10">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{cat}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.filter((i) => i.category === cat).map((i) => (
              <Card key={i.id} className="flex items-start gap-4 border-border bg-card p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {i.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold">{i.name}</div>
                    {i.connected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">
                        <Check className="h-3 w-3" /> Connected
                      </span>
                    )}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</div>
                  <Button
                    variant={i.connected ? "outline" : "default"}
                    size="sm"
                    className={`mt-3 h-8 rounded-full ${i.connected ? "border-border bg-surface" : ""}`}
                    onClick={() => {
                      toggleIntegration(i.id);
                      toast.success(i.connected ? `${i.name} disconnected` : `${i.name} connected`);
                    }}
                  >
                    {i.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
