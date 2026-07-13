import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Rocket,
  FolderKanban,
  Plug,
  Sparkles,
  BookOpen,
  Calendar,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/auth-shell";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/missions", label: "Missions", icon: Rocket },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/ai-models", label: "AI Models", icon: Sparkles },
  { to: "/api-keys", label: "API Keys", icon: KeyRound },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/workspace", label: "Workspace", icon: Building2 },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 md:flex",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}>
        <Logo size={32} />
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">DeskOne</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Execution</div>
          </div>
        )}
      </div>

      <nav className="mt-2 flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3">
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
