import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Bell, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

const notifications = [
  { id: "1", icon: CheckCircle2, title: "Mission completed", body: "Create YouTube content finished with 4 outputs.", time: "2m ago", tint: "var(--color-success)" },
  { id: "2", icon: Zap, title: "Step 3 running", body: "Preparing Stripe checkout for Ebook launch.", time: "18m ago", tint: "var(--color-primary)" },
  { id: "3", icon: AlertTriangle, title: "Approval required", body: "Draft social thread is ready for review.", time: "1h ago", tint: "var(--color-warning)" },
  { id: "4", icon: Bell, title: "Weekly digest", body: "You completed 6 missions this week.", time: "Yesterday", tint: "var(--color-secondary)" },
];

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every important update from your missions.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <Card key={n.id} className="flex items-start gap-4 border-border bg-card p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${n.tint} 20%, transparent)`, color: n.tint }}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-semibold">{n.title}</div>
                  <div className="shrink-0 text-xs text-muted-foreground">{n.time}</div>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
