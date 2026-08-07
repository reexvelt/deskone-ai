import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AnchorSpace" },
      { name: "description", content: "Control notifications, security and workspace defaults for AnchorSpace." },
      { property: "og:title", content: "Settings · AnchorSpace" },
      { property: "og:description", content: "Control notifications, security and workspace defaults for AnchorSpace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { logout } = useAuth();
  const { credits } = useStore();
  const navigate = useNavigate();
  const [autoApprove, setAutoApprove] = useState(false);
  const [notify, setNotify] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const pct = Math.round((credits.used / credits.total) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferences, billing, and workspace controls.</p>
      </div>

      <div className="space-y-4">
        <Card className="border-border bg-card p-6">
          <div className="text-sm font-semibold">Appearance</div>
          <div className="mt-1 text-xs text-muted-foreground">
            AnchorSpace is dark-first. Light and system themes are fully supported.
          </div>
          <ThemePicker />
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="text-sm font-semibold">Mission execution</div>
          <div className="mt-1 text-xs text-muted-foreground">Control how AnchorSpace executes on your behalf.</div>
          <Row label="Auto-approve low-risk missions" description="Skip approval for missions under 5 steps and no external send.">
            <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
          </Row>
          <Row label="Email notifications" description="Get notified when missions complete or need approval.">
            <Switch checked={notify} onCheckedChange={setNotify} />
          </Row>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="text-sm font-semibold">Usage</div>
          <div className="mt-1 text-xs text-muted-foreground">Credits reset on the 1st of each month.</div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{credits.used.toLocaleString()} of {credits.total.toLocaleString()} credits</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
          <Button variant="outline" className="mt-5 rounded-full border-border bg-surface">Upgrade plan</Button>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="text-sm font-semibold">Privacy</div>
          <Row label="Anonymous usage analytics" description="Help improve AnchorSpace without sharing personal data.">
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
          </Row>
        </Card>

        <Card className="border-destructive/30 bg-card p-6">
          <div className="text-sm font-semibold text-destructive">Danger zone</div>
          <Row label="Sign out" description="End your AnchorSpace session on this device.">
            <Button
              variant="outline"
              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => {
                logout();
                toast("Signed out");
                navigate({ to: "/login" });
              }}
            >
              Sign out
            </Button>
          </Row>
        </Card>
      </div>
    </div>
  );
}

const THEMES: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "System", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setTheme(t.id);
            toast.success(`${t.label} theme applied`);
          }}
          aria-pressed={theme === t.id}
          className={cn(
            "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border bg-surface/60 p-4 text-xs font-medium transition",
            theme === t.id ? "border-primary text-foreground ring-1 ring-primary/40" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <t.icon className="h-5 w-5" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-5 first:mt-6">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
