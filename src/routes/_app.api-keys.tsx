import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Key, Plus, ShieldCheck, ShieldAlert, Loader2, Trash2, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { useStore, type ProviderId } from "@/lib/store";

export const Route = createFileRoute("/_app/api-keys")({
  head: () => ({
    meta: [
      { title: "API Keys · AnchorSpace" },
      { name: "description", content: "Store and rotate provider API keys securely for your AnchorSpace workspace." },
      { property: "og:title", content: "API Keys · AnchorSpace" },
      { property: "og:description", content: "Store and rotate provider API keys securely for your AnchorSpace workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApiKeysPage,
});

const PROVIDER_LABEL: Record<ProviderId, string> = {
  openai: "OpenAI",
  gemini: "Google Gemini",
  claude: "Anthropic Claude",
  elevenlabs: "ElevenLabs",
  openrouter: "OpenRouter",
};

function ApiKeysPage() {
  const { apiKeys, addApiKey, removeApiKey, testApiKey } = useStore();
  const [open, setOpen] = useState(false);
  const [providerId, setProviderId] = useState<ProviderId>("openai");
  const [label, setLabel] = useState("");
  const [rawKey, setRawKey] = useState("");
  const [testing, setTesting] = useState<string | null>(null);

  const submit = () => {
    if (!rawKey.trim()) return toast.error("Enter an API key");
    if (rawKey.trim().length < 12) return toast.error("Key looks too short");
    addApiKey({ providerId, label, rawKey });
    toast.success(`${PROVIDER_LABEL[providerId]} key saved securely`);
    setOpen(false);
    setLabel("");
    setRawKey("");
  };

  const runTest = async (id: string) => {
    setTesting(id);
    const ok = await testApiKey(id);
    setTesting(null);
    ok ? toast.success("Connection valid") : toast.error("Validation failed");
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bring your own provider keys. Stored securely — full keys are never displayed.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full glow-primary">
              <Plus className="mr-1 h-4 w-4" /> Add key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle>Add API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={providerId} onValueChange={(v) => setProviderId(v as ProviderId)}>
                  <SelectTrigger className="bg-surface"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PROVIDER_LABEL) as ProviderId[]).map((id) => (
                      <SelectItem key={id} value={id}>{PROVIDER_LABEL[id]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Production key" className="bg-surface" />
              </div>
              <div className="space-y-2">
                <Label>Secret key</Label>
                <Input
                  type="password"
                  value={rawKey}
                  onChange={(e) => setRawKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-surface font-mono"
                  autoComplete="off"
                />
                <div className="text-xs text-muted-foreground">
                  Only a masked preview will be stored in the UI.
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button onClick={submit} className="rounded-full glow-primary">Save key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card className="grid place-items-center gap-3 border-dashed border-border bg-card p-14 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Key className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium">No API keys yet</div>
          <div className="max-w-sm text-xs text-muted-foreground">
            Add a provider key to unlock BYO models across your missions.
          </div>
        </Card>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {apiKeys.map((k) => (
            <div key={k.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Key className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">{k.label}</div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    {PROVIDER_LABEL[k.providerId]}
                  </span>
                  <StatusPill status={k.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{k.maskedKey}</span>
                  <span>·</span>
                  <span>
                    {k.lastTestedAt
                      ? `Tested ${new Date(k.lastTestedAt).toLocaleString()}`
                      : "Never tested"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border bg-surface"
                  onClick={() => runTest(k.id)}
                  disabled={testing === k.id}
                >
                  {testing === k.id ? (
                    <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Testing</>
                  ) : (
                    "Validate connection"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => { removeApiKey(k.id); toast("Key removed"); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: "valid" | "invalid" | "untested" }) {
  if (status === "valid")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">
        <ShieldCheck className="h-3 w-3" /> Valid
      </span>
    );
  if (status === "invalid")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive">
        <ShieldAlert className="h-3 w-3" /> Invalid
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
      <CircleDot className="h-3 w-3" /> Untested
    </span>
  );
}
