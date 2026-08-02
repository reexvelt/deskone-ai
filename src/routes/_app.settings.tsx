import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
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
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preferences, billing, and workspace controls.</p>
      </div>

      <div className="space-y-4">
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
