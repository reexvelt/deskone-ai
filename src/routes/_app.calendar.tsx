import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore, type Mission, type ProjectAsset } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Rocket, Send } from "lucide-react";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar · AnchorSpace" },
      { name: "description", content: "See every scheduled mission, publish date and deadline on one calendar." },
      { property: "og:title", content: "Calendar · AnchorSpace" },
      { property: "og:description", content: "See every scheduled mission, publish date and deadline on one calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalendarPage,
});

type View = "month" | "week" | "day" | "agenda";

interface Entry {
  id: string;
  title: string;
  at: number;
  type: "mission" | "publish" | "deadline" | "reminder";
  missionId?: string;
  meta?: string;
}

const TYPE_STYLES: Record<Entry["type"], string> = {
  mission: "bg-primary/15 text-primary",
  publish: "bg-secondary/15 text-secondary",
  deadline: "bg-warning/15 text-warning",
  reminder: "bg-muted text-muted-foreground",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function sameDay(a: number, b: number) {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}
function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function missionEntries(missions: Mission[]): Entry[] {
  return missions.flatMap<Entry>((m) => {
    const out: Entry[] = [];
    if (m.scheduledAt) out.push({ id: `m-${m.id}`, title: m.title, at: m.scheduledAt, type: "mission", missionId: m.id, meta: "Scheduled mission" });
    else if (m.status === "running" || m.status === "awaiting_approval")
      out.push({ id: `m-${m.id}`, title: m.title, at: m.startedAt ?? m.createdAt, type: "mission", missionId: m.id, meta: m.status === "running" ? "Running now" : "Awaiting approval" });
    else if (m.status === "completed" && m.completedAt)
      out.push({ id: `m-${m.id}`, title: m.title, at: m.completedAt, type: "deadline", missionId: m.id, meta: "Completed" });
    return out;
  });
}

function assetEntries(assets: ProjectAsset[]): Entry[] {
  return assets
    .filter((a) => a.publish?.scheduledAt || a.publish?.publishedAt)
    .map<Entry>((a) => ({
      id: `a-${a.id}`,
      title: a.title,
      at: (a.publish?.scheduledAt ?? a.publish?.publishedAt)!,
      type: "publish",
      meta: `${a.publish?.state === "published" ? "Published" : "Scheduled"} · ${a.publish?.platform ?? "Studio"}`,
    }));
}

function CalendarPage() {
  const { missions, assets, events } = useStore();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));

  const entries = useMemo<Entry[]>(
    () =>
      [
        ...missionEntries(missions),
        ...assetEntries(assets),
        ...events.map<Entry>((e) => ({ id: `e-${e.id}`, title: e.title, at: e.date, type: e.type, meta: e.time })),
      ].sort((a, b) => a.at - b.at),
    [missions, assets, events],
  );

  const cursorDate = new Date(cursor);
  const heading =
    view === "month"
      ? cursorDate.toLocaleString(undefined, { month: "long", year: "numeric" })
      : view === "day"
        ? cursorDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
        : view === "week"
          ? `Week of ${new Date(cursor - cursorDate.getDay() * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
          : "Everything upcoming";

  function shift(dir: number) {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(startOfDay(d));
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Calendar</p>
          <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scheduled missions, publishes and deadlines across your workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view !== "agenda" && (
            <div className="inline-flex items-center rounded-full border border-border bg-surface p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => shift(-1)} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                className="px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setCursor(startOfDay(new Date()))}
              >
                Today
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => shift(1)} aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="inline-flex rounded-full border border-border bg-surface p-1">
            {(["month", "week", "day", "agenda"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed border-border bg-surface/40 p-16 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-medium">Nothing scheduled yet</div>
          <p className="max-w-sm text-xs text-muted-foreground">
            Schedule a mission or a Studio publish and it will show up here automatically.
          </p>
          <Button asChild className="mt-2 rounded-full">
            <Link to="/missions">Start a mission</Link>
          </Button>
        </Card>
      ) : view === "month" ? (
        <MonthGrid cursor={cursor} entries={entries} onPickDay={(ts) => { setCursor(ts); setView("day"); }} />
      ) : view === "week" ? (
        <WeekGrid cursor={cursor} entries={entries} onPickDay={(ts) => { setCursor(ts); setView("day"); }} />
      ) : view === "day" ? (
        <DayList cursor={cursor} entries={entries} />
      ) : (
        <Agenda entries={entries} />
      )}
    </div>
  );
}

function EntryChip({ e }: { e: Entry }) {
  const inner = (
    <span className={cn("block truncate rounded-lg px-2 py-1 text-left text-[11px] font-medium", TYPE_STYLES[e.type])}>
      {timeLabel(e.at)} · {e.title}
    </span>
  );
  return e.missionId ? (
    <Link to="/missions/$missionId" params={{ missionId: e.missionId }} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function MonthGrid({ cursor, entries, onPickDay }: { cursor: number; entries: Entry[]; onPickDay: (ts: number) => void }) {
  const d = new Date(cursor);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const lead = first.getDay();
  const today = startOfDay(new Date());
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(d.getFullYear(), d.getMonth(), i + 1).getTime())];

  return (
    <Card className="overflow-hidden border-border bg-card p-2 sm:p-4">
      <div className="grid grid-cols-7 gap-1 pb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
          <div key={i} className="text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((ts, i) => {
          if (ts === null) return <div key={`x${i}`} className="min-h-16 rounded-xl sm:min-h-24" />;
          const dayEntries = entries.filter((e) => sameDay(e.at, ts));
          return (
            <button
              key={ts}
              onClick={() => onPickDay(ts)}
              className={cn(
                "min-h-16 rounded-xl border border-border/60 bg-surface/40 p-1.5 text-left transition hover:border-primary/40 sm:min-h-24 sm:p-2",
                ts === today && "border-primary/50 bg-primary/5",
              )}
            >
              <div className={cn("text-[11px] font-semibold", ts === today ? "text-primary" : "text-muted-foreground")}>
                {new Date(ts).getDate()}
              </div>
              <div className="mt-1 space-y-1">
                {dayEntries.slice(0, 2).map((e) => (
                  <span key={e.id} className={cn("block truncate rounded-md px-1.5 py-0.5 text-[10px]", TYPE_STYLES[e.type])}>
                    {e.title}
                  </span>
                ))}
                {dayEntries.length > 2 && (
                  <span className="block px-1.5 text-[10px] text-muted-foreground">+{dayEntries.length - 2} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function WeekGrid({ cursor, entries, onPickDay }: { cursor: number; entries: Entry[]; onPickDay: (ts: number) => void }) {
  const base = new Date(cursor);
  const weekStart = startOfDay(new Date(cursor - base.getDay() * 86400000));
  const today = startOfDay(new Date());
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {Array.from({ length: 7 }, (_, i) => weekStart + i * 86400000).map((ts) => {
        const dayEntries = entries.filter((e) => sameDay(e.at, ts));
        return (
          <Card
            key={ts}
            className={cn("min-h-40 border-border bg-card p-3", ts === today && "border-primary/50")}
            onClick={() => onPickDay(ts)}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {new Date(ts).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
            </div>
            <div className="mt-2 space-y-1.5">
              {dayEntries.length === 0 ? (
                <span className="text-[11px] text-muted-foreground/70">—</span>
              ) : (
                dayEntries.map((e) => <EntryChip key={e.id} e={e} />)
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function DayList({ cursor, entries }: { cursor: number; entries: Entry[] }) {
  const dayEntries = entries.filter((e) => sameDay(e.at, cursor));
  if (dayEntries.length === 0) {
    return (
      <Card className="border-dashed border-border bg-surface/40 p-14 text-center text-sm text-muted-foreground">
        Nothing scheduled on this day.
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {dayEntries.map((e) => (
        <EntryRow key={e.id} e={e} />
      ))}
    </div>
  );
}

function Agenda({ entries }: { entries: Entry[] }) {
  const groups = entries.reduce<Record<number, Entry[]>>((acc, e) => {
    const key = startOfDay(new Date(e.at));
    (acc[key] ??= []).push(e);
    return acc;
  }, {});
  return (
    <div className="space-y-8">
      {Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map((day) => (
          <section key={day}>
            <div className="eyebrow mb-3">
              {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="space-y-2">
              {groups[day].map((e) => (
                <EntryRow key={e.id} e={e} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function EntryRow({ e }: { e: Entry }) {
  const Icon = e.type === "publish" ? Send : e.type === "mission" ? Rocket : Clock;
  const body = (
    <Card className="flex items-center gap-4 border-border bg-card p-4 transition hover:border-primary/40">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TYPE_STYLES[e.type])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{e.title}</div>
        <div className="truncate text-xs text-muted-foreground">{e.meta ?? e.type}</div>
      </div>
      <div className="shrink-0 text-xs text-muted-foreground">{timeLabel(e.at)}</div>
    </Card>
  );
  return e.missionId ? (
    <Link to="/missions/$missionId" params={{ missionId: e.missionId }} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
