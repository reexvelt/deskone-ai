import { useEffect, useState, useMemo, createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { Rocket, FolderKanban, BookOpen, Plug, Settings, Bell, Home, Sparkles, Calendar, User } from "lucide-react";

interface CommandPaletteContextValue {
  open: () => void;
}

const Ctx = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { missions, projects, knowledge, integrations, notifications } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const nav = useMemo(
    () => [
      { label: "Home", to: "/home", icon: Home },
      { label: "Missions", to: "/missions", icon: Rocket },
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "Knowledge", to: "/knowledge", icon: BookOpen },
      { label: "Integrations", to: "/integrations", icon: Plug },
      { label: "AI Models", to: "/ai-models", icon: Sparkles },
      { label: "Calendar", to: "/calendar", icon: Calendar },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Profile", to: "/profile", icon: User },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    [],
  );

  const go = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 0);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read && !n.archived).length;

  return (
    <Ctx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search missions, projects, knowledge, apps…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <CommandItem
                  key={n.to}
                  onSelect={() => go(() => navigate({ to: n.to }))}
                  value={`nav ${n.label}`}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {n.label}
                  {n.to === "/notifications" && unreadNotifCount > 0 && (
                    <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">{unreadNotifCount}</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {missions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Missions">
                {missions.slice(0, 8).map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`mission ${m.title} ${m.objective}`}
                    onSelect={() => go(() => navigate({ to: "/missions/$missionId", params: { missionId: m.id } }))}
                  >
                    <Rocket className="mr-2 h-4 w-4 text-primary" />
                    <span className="truncate">{m.title}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{m.status.replace("_", " ")}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {projects.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`project ${p.name} ${p.description}`}
                    onSelect={() => go(() => navigate({ to: "/projects/$projectId", params: { projectId: p.id } }))}
                  >
                    <span className="mr-2 h-3 w-3 rounded-full" style={{ background: p.color }} />
                    <span className="truncate">{p.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{p.missionCount} missions</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {knowledge.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Knowledge">
                {knowledge.slice(0, 6).map((k) => (
                  <CommandItem
                    key={k.id}
                    value={`knowledge ${k.name} ${k.tag ?? ""}`}
                    onSelect={() => go(() => navigate({ to: "/knowledge" }))}
                  >
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{k.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{k.size}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {integrations.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Apps">
                {integrations.map((i) => (
                  <CommandItem
                    key={i.id}
                    value={`app ${i.name} ${i.category}`}
                    onSelect={() => go(() => navigate({ to: "/integrations" }))}
                  >
                    <Plug className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{i.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{i.connected ? "Connected" : "Not connected"}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </Ctx.Provider>
  );
}
