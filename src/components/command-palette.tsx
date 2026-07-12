import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Command as CommandPrimitive,
} from "cmdk";
import { useStore } from "@/lib/store";
import {
  Home, Rocket, FolderKanban, Plug, Sparkles, BookOpen, Calendar, Bell,
  User as UserIcon, Settings as SettingsIcon, FileText, Search,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CommandPaletteCtx {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const Ctx = createContext<CommandPaletteCtx | null>(null);

export function useCommandPalette() {
  const c = useContext(Ctx);
  if (!c) throw new Error("CommandPalette not mounted");
  return c;
}

const NAV: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Missions", to: "/missions", icon: Rocket },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Integrations", to: "/integrations", icon: Plug },
  { label: "AI Models", to: "/ai-models", icon: Sparkles },
  { label: "Knowledge", to: "/knowledge", icon: BookOpen },
  { label: "Calendar", to: "/calendar", icon: Calendar },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Profile", to: "/profile", icon: UserIcon },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { missions, projects, knowledge, integrations } = useStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setIsOpen(false);
    navigate({ to });
  };

  const value = useMemo(() => ({ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }), [isOpen]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden border-border bg-card p-0">
          <CommandPrimitive className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <CommandPrimitive.Input
                autoFocus
                placeholder="Search missions, projects, apps, knowledge…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</span>
            </div>
            <CommandPrimitive.List className="max-h-[420px] overflow-y-auto p-2">
              <CommandPrimitive.Empty className="p-8 text-center text-sm text-muted-foreground">No results found.</CommandPrimitive.Empty>

              <CommandPrimitive.Group heading="Navigation">
                {NAV.map((n) => (
                  <Row key={n.to} onSelect={() => go(n.to)} icon={<n.icon className="h-4 w-4 text-primary" />} title={n.label} subtitle={n.to} />
                ))}
              </CommandPrimitive.Group>

              {missions.length > 0 && (
                <CommandPrimitive.Group heading="Missions">
                  {missions.slice(0, 10).map((m) => (
                    <Row
                      key={m.id}
                      value={`mission ${m.title} ${m.objective}`}
                      onSelect={() => go(`/missions/${m.id}`)}
                      icon={<Rocket className="h-4 w-4 text-primary" />}
                      title={m.title}
                      subtitle={m.status.replace("_", " ")}
                    />
                  ))}
                </CommandPrimitive.Group>
              )}

              {projects.length > 0 && (
                <CommandPrimitive.Group heading="Projects">
                  {projects.map((p) => (
                    <Row
                      key={p.id}
                      value={`project ${p.name} ${p.description}`}
                      onSelect={() => go(`/projects/${p.id}`)}
                      icon={<FolderKanban className="h-4 w-4 text-secondary" />}
                      title={p.name}
                      subtitle={p.description}
                    />
                  ))}
                </CommandPrimitive.Group>
              )}

              {knowledge.length > 0 && (
                <CommandPrimitive.Group heading="Knowledge">
                  {knowledge.map((k) => (
                    <Row
                      key={k.id}
                      value={`knowledge ${k.name} ${k.tag ?? ""}`}
                      onSelect={() => go("/knowledge")}
                      icon={<FileText className="h-4 w-4 text-primary" />}
                      title={k.name}
                      subtitle={`${k.size} · used ${k.missionUsage}×`}
                    />
                  ))}
                </CommandPrimitive.Group>
              )}

              <CommandPrimitive.Group heading="Apps">
                {integrations.map((i) => (
                  <Row
                    key={i.id}
                    value={`app ${i.name} ${i.category}`}
                    onSelect={() => go("/integrations")}
                    icon={<Plug className="h-4 w-4 text-primary" />}
                    title={i.name}
                    subtitle={`${i.category} · ${i.connected ? "Connected" : "Not connected"}`}
                  />
                ))}
              </CommandPrimitive.Group>
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

function Row({
  onSelect, icon, title, subtitle, value,
}: { onSelect: () => void; icon: ReactNode; title: string; subtitle?: string; value?: string }) {
  return (
    <CommandPrimitive.Item
      value={value ?? title}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm aria-selected:bg-surface"
    >
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{title}</div>
        {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </CommandPrimitive.Item>
  );
}
