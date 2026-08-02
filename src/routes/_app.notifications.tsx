import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useStore, type NotificationCategory, type NotificationItem } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertTriangle, Zap, Plug, Sparkles, Archive, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · AnchorSpace" },
      { name: "description", content: "Approvals, completed missions and integration alerts in one inbox." },
      { property: "og:title", content: "Notifications · AnchorSpace" },
      { property: "og:description", content: "Approvals, completed missions and integration alerts in one inbox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

const CATEGORY_META: Record<NotificationCategory, { icon: React.ComponentType<{ className?: string }>; tint: string; label: string }> = {
  mission_completed: { icon: CheckCircle2, tint: "var(--color-success)", label: "Completed" },
  mission_failed: { icon: AlertTriangle, tint: "var(--color-destructive)", label: "Failed" },
  approval_required: { icon: Zap, tint: "var(--color-warning)", label: "Approval" },
  integration_error: { icon: Plug, tint: "var(--color-warning)", label: "Integration" },
  system_update: { icon: Sparkles, tint: "var(--color-secondary)", label: "System" },
};

const FILTERS: { id: "all" | "unread" | NotificationCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "mission_completed", label: "Completed" },
  { id: "approval_required", label: "Approvals" },
  { id: "mission_failed", label: "Failed" },
  { id: "integration_error", label: "Integrations" },
  { id: "system_update", label: "System" },
];

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, archiveNotification } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visible = useMemo(() => {
    return notifications
      .filter((n) => !n.archived)
      .filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.read;
        return n.category === filter;
      })
      .sort((a, b) => b.ts - a.ts);
  }, [notifications, filter]);

  const unread = notifications.filter((n) => !n.read && !n.archived).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "You're all caught up."}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full border-border bg-surface"
          onClick={() => { markAllNotificationsRead(); toast.success("Marked all as read"); }}
          disabled={unread === 0}
        >
          <Check className="mr-1 h-4 w-4" /> Mark all read
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            variant={filter === f.id ? "default" : "ghost"}
            size="sm"
            className={`rounded-full ${filter === f.id ? "" : "text-muted-foreground"}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((n) => (
          <Row key={n.id} n={n} onRead={markNotificationRead} onArchive={archiveNotification} />
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-14 text-center">
            <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
            <div className="mt-3 text-sm font-medium">Nothing here</div>
            <div className="text-xs text-muted-foreground">New activity will appear as your missions run.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ n, onRead, onArchive }: { n: NotificationItem; onRead: (id: string) => void; onArchive: (id: string) => void }) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  return (
    <Card
      className={`group flex items-start gap-4 border-border p-5 transition ${n.read ? "bg-card" : "bg-card ring-1 ring-primary/30"}`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${meta.tint} 20%, transparent)`, color: meta.tint }}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-semibold">{n.title}</div>
          {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{timeAgo(n.ts)}</span>
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
        <div className="mt-2 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          {!n.read && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => onRead(n.id)}>
              <Check className="mr-1 h-3 w-3" /> Mark read
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => { onArchive(n.id); toast("Archived"); }}>
            <Archive className="mr-1 h-3 w-3" /> Archive
          </Button>
        </div>
      </div>
    </Card>
  );
}
