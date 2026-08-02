import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type Integration } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, RefreshCw, ShieldAlert, ShieldCheck, Plug, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations · AnchorSpace" },
      { name: "description", content: "Connect Drive, Gmail, Notion, YouTube and 20+ tools so AnchorSpace can execute real work." },
      { property: "og:title", content: "Integrations · AnchorSpace" },
      { property: "og:description", content: "Connect Drive, Gmail, Notion, YouTube and 20+ tools so AnchorSpace can execute real work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { integrations, toggleIntegration, syncIntegration, reconnectIntegration } = useStore();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "connected" | "available">("all");

  const filtered = integrations.filter((i) => {
    if (tab === "connected" && !i.connected) return false;
    if (tab === "available" && i.connected) return false;
    if (query && !`${i.name} ${i.category} ${i.description}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const categories = Array.from(new Set(filtered.map((i) => i.category)));

  const connectedCount = integrations.filter((i) => i.connected).length;
  const needsAttention = integrations.filter((i) => i.connected && i.authStatus !== "healthy").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Integrations</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Connected apps</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Production-ready services AnchorSpace can operate on your behalf.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border-0 bg-primary/10 text-primary">{connectedCount} connected</Badge>
          {needsAttention > 0 && (
            <Badge className="rounded-full border-0 bg-warning/15 text-warning">{needsAttention} need attention</Badge>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations"
            className="h-10 rounded-full border-border bg-surface pl-9"
          />
        </div>
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {(["all", "connected", "available"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium capitalize transition",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-border bg-surface/40 p-14 text-center">
          <div className="text-sm text-muted-foreground">No integrations match your filters.</div>
        </Card>
      ) : (
        categories.map((cat) => (
          <section key={cat} className="mb-10">
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{cat}</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.filter((i) => i.category === cat).map((i) => (
                <IntegrationCard
                  key={i.id}
                  i={i}
                  onToggle={() => {
                    toggleIntegration(i.id);
                    toast.success(i.connected ? `${i.name} disconnected` : `${i.name} connected`);
                  }}
                  onSync={() => { syncIntegration(i.id); toast.success(`${i.name} synced`); }}
                  onReconnect={() => { reconnectIntegration(i.id); toast.success(`${i.name} reconnected`); }}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function IntegrationCard({
  i, onToggle, onSync, onReconnect,
}: {
  i: Integration;
  onToggle: () => void;
  onSync: () => void;
  onReconnect: () => void;
}) {
  const needsReauth = i.connected && i.authStatus === "reauth_required";
  const health = i.health ?? 0;
  const healthTone = health >= 90 ? "text-success" : health >= 60 ? "text-warning" : "text-destructive";

  return (
    <Card className="group relative flex flex-col gap-4 overflow-hidden border-border bg-card p-5 transition hover:border-primary/30">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-40"
        style={{ background: `radial-gradient(400px 80px at 20% 0%, ${i.accent ?? "#3B82F6"}33, transparent 70%)` }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${i.accent ?? "#3B82F6"}, ${i.accent ?? "#3B82F6"}cc)` }}
        >
          {i.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold">{i.name}</div>
            {i.connected ? (
              needsReauth ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-warning">
                  <ShieldAlert className="h-3 w-3" /> Reauth
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                  <ShieldCheck className="h-3 w-3" /> Connected
                </span>
              )
            ) : (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Available</span>
            )}
          </div>
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{i.description}</div>
        </div>
      </div>

      {i.supportedActions?.length ? (
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Supported actions</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {i.supportedActions.map((a) => (
              <span key={a} className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-foreground/80">
                {a}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {i.permissions?.length ? (
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Permissions</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {i.permissions.map((p) => (
              <span key={p} className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {p}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {i.connected && (
        <div className="relative grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface/60 p-3 text-[11px]">
          <div>
            <div className="text-muted-foreground">Connection health</div>
            <div className={cn("mt-0.5 text-sm font-semibold", healthTone)}>{health}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Last sync</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {i.lastSync ? relTime(i.lastSync) : "—"}
            </div>
          </div>
        </div>
      )}

      <div className="relative mt-auto flex flex-wrap items-center gap-2">
        {i.connected ? (
          <>
            {needsReauth ? (
              <Button size="sm" className="h-8 rounded-full" onClick={onReconnect}>
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Reconnect
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-8 rounded-full border-border bg-surface" onClick={onSync}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Sync
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 rounded-full text-muted-foreground" onClick={onToggle}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button size="sm" className="h-8 rounded-full" onClick={onToggle}>
            <Plug className="mr-1 h-3.5 w-3.5" /> Connect
          </Button>
        )}
      </div>
    </Card>
  );
}

function relTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
