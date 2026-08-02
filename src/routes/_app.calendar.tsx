import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({
    meta: [
      { title: "Content Calendar · AnchorSpace" },
      { name: "description", content: "See every scheduled mission, publish date and deadline on one calendar." },
      { property: "og:title", content: "Content Calendar · AnchorSpace" },
      { property: "og:description", content: "See every scheduled mission, publish date and deadline on one calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

const now = new Date();
const monthName = now.toLocaleString(undefined, { month: "long", year: "numeric" });
const first = new Date(now.getFullYear(), now.getMonth(), 1);
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const startDay = first.getDay();

const events: Record<number, { title: string; time: string; color: string }[]> = {
  [now.getDate()]: [{ title: "Ebook launch email", time: "14:00", color: "#3B82F6" }],
  [now.getDate() + 1]: [{ title: "Weekly content sync", time: "09:00", color: "#7C5CFF" }],
  [Math.min(daysInMonth, now.getDate() + 4)]: [{ title: "Newsletter drop", time: "10:00", color: "#22C55E" }],
};

function CalendarPage() {
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Scheduled missions and outputs.</p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">{monthName}</div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center">{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-2">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`min-h-[92px] rounded-xl border border-border/60 p-2 ${c === now.getDate() ? "bg-primary/10 ring-1 ring-primary/40" : c ? "bg-surface/40" : "opacity-30"}`}
            >
              {c && <div className="text-xs font-medium text-muted-foreground">{c}</div>}
              <div className="mt-1 space-y-1">
                {c && events[c]?.map((e, j) => (
                  <div key={j} className="truncate rounded-md px-2 py-1 text-[11px]" style={{ background: `color-mix(in oklab, ${e.color} 20%, transparent)`, color: e.color }}>
                    {e.time} · {e.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
