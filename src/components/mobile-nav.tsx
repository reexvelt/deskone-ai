import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home,
  Rocket,
  FolderKanban,
  Film,
  Menu,
  Plug,
  Sparkles,
  BookOpen,
  Calendar,
  Bell,
  User,
  Settings,
  KeyRound,
  Building2,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/auth-shell";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/missions", label: "Missions", icon: Rocket },
  { to: "/studio", label: "Studio", icon: Film },
  { to: "/projects", label: "Projects", icon: FolderKanban },
] as const;

const drawerItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/missions", label: "Missions", icon: Rocket },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/studio", label: "Content Studio", icon: Film },
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

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {primary.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-muted-foreground active:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-12 place-items-center rounded-full transition",
                    active && "bg-primary/15",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground active:text-foreground">
                <span className="grid h-8 w-12 place-items-center rounded-full">
                  <Menu className="h-[18px] w-[18px]" />
                </span>
                More
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm border-l border-border bg-background p-0">
              <div className="flex items-center justify-between px-5 py-5">
                <div className="flex items-center gap-3">
                  <Logo size={32} />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">AnchorSpace</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Execution
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-1 px-3 pb-8">
                {drawerItems.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                          active
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground active:bg-surface",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-xl",
                            active ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
