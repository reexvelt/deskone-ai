import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Command, LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const titles: Record<string, string> = {
  "/home": "Home",
  "/missions": "Missions",
  "/projects": "Projects",
  "/integrations": "Integrations",
  "/ai-models": "AI Models",
  "/knowledge": "Knowledge",
  "/calendar": "Calendar",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function TopNav() {
  const { user, logout } = useAuth();
  const { notifications } = useStore();
  const { open: openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const key = Object.keys(titles).find((k) => pathname === k || pathname.startsWith(k + "/")) ?? "/home";
  const title = titles[key];
  const unread = notifications.filter((n) => !n.read && !n.archived).length;
  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/70 px-3 backdrop-blur-xl sm:gap-4 sm:px-4 md:px-8">
      <div className="min-w-0 flex-1">
        <div className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">DeskOne</div>
        <div className="truncate text-sm font-semibold">{title}</div>
      </div>

      <div className="hidden max-w-md flex-1 md:block">
        <button
          onClick={openPalette}
          className="group flex w-full items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-surface"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate">Search missions, projects, apps…</span>
          <span className="hidden items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground lg:flex">
            <Command className="h-3 w-3" /> K
          </span>
        </button>
      </div>

      <Button variant="ghost" size="icon" className="rounded-full md:hidden" onClick={openPalette}>
        <Search className="h-5 w-5" />
      </Button>

      <Link to="/notifications" className="relative">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {unread}
          </span>
        )}
      </Link>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-3 transition hover:bg-surface">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-xs font-semibold">{user?.name}</div>
              <div className="text-[10px] text-muted-foreground">{user?.email}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
            <UserIcon className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <SettingsIcon className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
