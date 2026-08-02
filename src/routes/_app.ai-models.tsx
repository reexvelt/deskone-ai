import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, type ProviderId } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Palette, Eye, ShieldCheck, ShieldAlert, Loader2, Star, KeyRound, CircleDot } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai-models")({
  head: () => ({
    meta: [
      { title: "AI Models · AnchorSpace" },
      { name: "description", content: "Choose and configure the AI models that power your missions, from fast drafting to deep reasoning." },
      { property: "og:title", content: "AI Models · AnchorSpace" },
      { property: "og:description", content: "Choose and configure the AI models that power your missions, from fast drafting to deep reasoning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModelsPage,
});

const iconMap = {
  reasoning: Sparkles,
  fast: Zap,
  creative: Palette,
  vision: Eye,
};

function ModelsPage() {
  const { models, toggleModel, providers, apiKeys, updateProvider, setDefaultProvider, testProvider } = useStore();
  const [testing, setTesting] = useState<ProviderId | null>(null);

  const runTest = async (id: ProviderId) => {
    setTesting(id);
    const ok = await testProvider(id);
    setTesting(null);
    ok ? toast.success("Connection successful") : toast.error("Add or select an API key first");
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">AI Models</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure providers, pick a default, and choose which models AnchorSpace routes missions through.
        </p>
      </div>

      <section className="mb-12">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Providers</div>
          <Link to="/api-keys" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <KeyRound className="h-3.5 w-3.5" /> Manage API keys
          </Link>
        </div>
        <div className="space-y-3">
          {providers.map((p) => {
            const key = apiKeys.find((k) => k.id === p.apiKeyId);
            return (
              <Card key={p.id} className="border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/25 to-secondary/25 text-primary text-sm font-semibold">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">{p.name}</div>
                      <ProviderStatus status={p.status} />
                      {p.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.description}</div>
                  </div>
                  <Switch checked={p.enabled} onCheckedChange={(v) => updateProvider(p.id, { enabled: v })} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Model</div>
                    <Input
                      className="h-9 bg-surface text-sm"
                      value={p.defaultModel}
                      onChange={(e) => updateProvider(p.id, { defaultModel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">API key</div>
                    <div className="flex h-9 items-center rounded-md border border-border bg-surface px-3 text-xs font-mono text-muted-foreground">
                      {key ? key.maskedKey : "No key linked"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Last tested</div>
                    <div className="flex h-9 items-center rounded-md border border-border bg-surface px-3 text-xs text-muted-foreground">
                      {p.lastTestedAt ? new Date(p.lastTestedAt).toLocaleString() : "Never"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border bg-surface"
                    onClick={() => runTest(p.id)}
                    disabled={testing === p.id}
                  >
                    {testing === p.id ? (
                      <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Testing</>
                    ) : (
                      "Test connection"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => { setDefaultProvider(p.id); toast.success(`${p.name} is now default`); }}
                    disabled={p.isDefault}
                  >
                    <Star className="mr-1 h-3.5 w-3.5" /> Set default
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">AnchorSpace models</div>
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
      </section>
    </div>
  );
}

function ProviderStatus({ status }: { status: "connected" | "disconnected" | "error" }) {
  if (status === "connected")
    return <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success"><ShieldCheck className="h-3 w-3" /> Connected</span>;
  if (status === "error")
    return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive"><ShieldAlert className="h-3 w-3" /> Error</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"><CircleDot className="h-3 w-3" /> Disconnected</span>;
}
