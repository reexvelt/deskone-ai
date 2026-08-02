import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStore, type WorkspaceMemory } from "@/lib/store";
import { Building2, Palette, Clock, Globe, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/_app/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace Memory · AnchorSpace" },
      { name: "description", content: "Teach AnchorSpace your brand name, tone of voice and business context." },
      { property: "og:title", content: "Workspace Memory · AnchorSpace" },
      { property: "og:description", content: "Teach AnchorSpace your brand name, tone of voice and business context." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspacePage,
});

function WorkspacePage() {
  const { workspace, updateWorkspace, integrations } = useStore();
  const [draft, setDraft] = useState<WorkspaceMemory>(workspace);
  const dirty = JSON.stringify(draft) !== JSON.stringify(workspace);

  const set = <K extends keyof WorkspaceMemory>(k: K, v: WorkspaceMemory[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    updateWorkspace(draft);
    toast.success("Workspace memory updated");
  };

  const connectedApps = integrations.filter((i) => i.connected).map((i) => i.name);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Workspace Memory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Context AnchorSpace remembers across every mission — brand, tone, hours, and more.
          </p>
        </div>
        <Button
          className="rounded-full glow-primary"
          onClick={save}
          disabled={!dirty}
        >
          Save changes
        </Button>
      </div>

      <div className="space-y-4">
        <Section icon={Building2} title="Workspace" subtitle="Identity and business info">
          <Field label="Workspace name">
            <Input className="bg-surface" value={draft.workspaceName} onChange={(e) => set("workspaceName", e.target.value)} />
          </Field>
          <Field label="Brand name">
            <Input className="bg-surface" value={draft.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </Field>
          <Field label="Business information" full>
            <Textarea
              className="min-h-24 bg-surface"
              value={draft.businessInfo}
              onChange={(e) => set("businessInfo", e.target.value)}
              placeholder="Who you are, what you sell, who it's for."
            />
          </Field>
        </Section>

        <Section icon={Palette} title="Brand" subtitle="Colors and voice used by generators">
          <Field label="Brand colors" full>
            <div className="flex flex-wrap gap-2">
              {draft.brandColors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-full border border-border bg-surface pl-2 pr-1 py-1">
                  <span className="h-4 w-4 rounded-full ring-1 ring-inset ring-border" style={{ background: c }} />
                  <input
                    className="w-24 bg-transparent text-xs outline-none"
                    value={c}
                    onChange={(e) => {
                      const next = [...draft.brandColors];
                      next[i] = e.target.value;
                      set("brandColors", next);
                    }}
                  />
                  <button
                    className="rounded-full px-2 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => set("brandColors", draft.brandColors.filter((_, ix) => ix !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => set("brandColors", [...draft.brandColors, "#3B82F6"])}
              >
                + Add color
              </button>
            </div>
          </Field>
          <Field label="Writing tone" full>
            <Textarea
              className="min-h-20 bg-surface"
              value={draft.writingTone}
              onChange={(e) => set("writingTone", e.target.value)}
            />
          </Field>
        </Section>

        <Section icon={Sparkles} title="AI defaults" subtitle="Model preferences and templates">
          <Field label="Preferred AI model">
            <Input className="bg-surface" value={draft.preferredModel} onChange={(e) => set("preferredModel", e.target.value)} />
          </Field>
          <Field label="Favorite templates" full>
            <Input
              className="bg-surface"
              value={draft.favoriteTemplates.join(", ")}
              onChange={(e) => set("favoriteTemplates", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="Launch email, Weekly newsletter, YouTube script"
            />
          </Field>
        </Section>

        <Section icon={Clock} title="Schedule" subtitle="Timezone and working hours">
          <Field label="Working hours start">
            <Input type="time" className="bg-surface" value={draft.workingHoursStart} onChange={(e) => set("workingHoursStart", e.target.value)} />
          </Field>
          <Field label="Working hours end">
            <Input type="time" className="bg-surface" value={draft.workingHoursEnd} onChange={(e) => set("workingHoursEnd", e.target.value)} />
          </Field>
          <Field label="Time zone">
            <Input className="bg-surface" value={draft.timeZone} onChange={(e) => set("timeZone", e.target.value)} />
          </Field>
          <Field label="Language">
            <Input className="bg-surface" value={draft.language} onChange={(e) => set("language", e.target.value)} />
          </Field>
        </Section>

        <Section icon={Users} title="Social accounts" subtitle="Handles missions will publish to">
          <div className="col-span-full space-y-2">
            {draft.socialAccounts.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="w-40 bg-surface"
                  value={s.platform}
                  onChange={(e) => {
                    const next = [...draft.socialAccounts];
                    next[i] = { ...next[i], platform: e.target.value };
                    set("socialAccounts", next);
                  }}
                  placeholder="Platform"
                />
                <Input
                  className="flex-1 bg-surface"
                  value={s.handle}
                  onChange={(e) => {
                    const next = [...draft.socialAccounts];
                    next[i] = { ...next[i], handle: e.target.value };
                    set("socialAccounts", next);
                  }}
                  placeholder="@handle"
                />
                <Button
                  variant="ghost"
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => set("socialAccounts", draft.socialAccounts.filter((_, ix) => ix !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="rounded-full border-dashed border-border bg-surface"
              onClick={() => set("socialAccounts", [...draft.socialAccounts, { platform: "", handle: "" }])}
            >
              + Add account
            </Button>
          </div>
        </Section>

        <Section icon={Globe} title="Connected apps" subtitle="Managed from the Integrations page">
          <div className="col-span-full flex flex-wrap gap-1.5">
            {connectedApps.length === 0 ? (
              <div className="text-xs text-muted-foreground">No apps connected yet.</div>
            ) : (
              connectedApps.map((a) => (
                <span key={a} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{a}</span>
              ))
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, children }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border bg-card p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
