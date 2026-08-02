import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { CommandPaletteProvider, useCommandPalette } from "@/components/command-palette";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Bell,
  CalendarDays,
  Command,
  FolderKanban,
  Home,
  Layers3,
  LibraryBig,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  SquareTerminal,
  KeyRound,
  Building2,
  UserCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayoutRoute,
});

type NavItem = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Work",
    items: [
      { label: "Home", to: "/home", icon: Home },
      { label: "Missions", to: "/missions", icon: Command },
      { label: "Projects", to: "/projects", icon: FolderKanban },
      { label: "Studio", to: "/studio", icon: Sparkles },
      { label: "Calendar", to: "/calendar", icon: CalendarDays },
    ],
  },
  {
    title: "Connected tools",
    items: [
      { label: "Integrations", to: "/integrations", icon: Layers3 },
      { label: "AI Models", to: "/ai-models", icon: SquareTerminal },
      { label: "API Keys", to: "/api-keys", icon: KeyRound },
      { label: "Knowledge", to: "/knowledge", icon: LibraryBig },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Workspace", to: "/workspace", icon: Building2 },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Profile", to: "/profile", icon: UserCircle2 },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

const mobileTabs: NavItem[] = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Missions", to: "/missions", icon: Command },
  { label: "Studio", to: "/studio", icon: Sparkles },
  { label: "Projects", to: "/projects", icon: FolderKanban },
];

function AppLayoutRoute() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Opening your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <CommandPaletteProvider>
      <AppShell />
    </CommandPaletteProvider>
  );
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("anchorspace.sidebar.collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      localStorage.setItem("anchorspace.sidebar.collapsed", v ? "0" : "1");
      return !v;
    });
  }

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-sidebar/95 backdrop-blur-xl transition-[width] duration-300 lg:flex ${
          collapsed ? "w-[84px]" : "w-[272px]"
        }`}
      >
        <div className="flex w-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-border px-4">
            <Link
              to="/home"
              className="flex min-w-0 flex-1 items-center gap-3"
              aria-label="AnchorSpace home"
            >
              <BrandMark />
              {!collapsed && (
                <span className="truncate text-sm font-semibold tracking-tight">AnchorSpace</span>
              )}
            </Link>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-xl"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>

          {collapsed && (
            <div className="flex justify-center py-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-5">
                {!collapsed && <p className="eyebrow mb-2 px-3">{group.title}</p>}
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <SideLink item={item} collapsed={collapsed} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {!collapsed && <SidebarFooterCard />}
        </div>
      </aside>

      <div className={`flex min-h-dvh flex-col ${collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]"}`}>
        <TopBar />
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}

function BrandMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary to-primary text-sm font-black text-primary-foreground shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-secondary)_70%,transparent)]">
      A
    </span>
  );
}

function SideLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground ${
        collapsed ? "justify-center" : ""
      }`}
      activeProps={{ className: "bg-sidebar-accent text-foreground" }}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </Link>
  );
}

function SidebarFooterCard() {
  const { credits, integrations } = useStore();
  const connected = integrations.filter((i) => i.connected).length;
  const pct = Math.min(100, Math.round((credits.used / Math.max(1, credits.total)) * 100));

  return (
    <div className="border-t border-border p-3">
      <div className="panel-inset p-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Credits</p>
          <p className="text-xs text-muted-foreground">{pct}%</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {credits.used.toLocaleString()} of {credits.total.toLocaleString()} used · {connected} app
          {connected === 1 ? "" : "s"} connected
        </p>
      </div>
    </div>
  );
}

function TopBar() {
  const { user, logout } = useAuth();
  const { notifications } = useStore();
  const { open: openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read && !n.archived).length;
  const initials = (user?.name ?? "You")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-10">
        <MobileDrawer />

        <button
          type="button"
          onClick={openPalette}
          className="group flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface/50 px-4 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-surface md:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search missions, projects, apps…</span>
          <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] lg:flex">
            <Command className="h-3 w-3" /> K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
              <Bell className="h-5 w-5" />
            </Button>
            {unread > 0 && (
              <span className="pointer-events-none absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-surface/50 p-1 transition hover:bg-surface sm:pr-3"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                  <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-xs font-semibold sm:block">
                  {user?.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate text-sm">{user?.name}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <UserCircle2 className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/workspace" })}>
                <Building2 className="mr-2 h-4 w-4" /> Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function MobileDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-xl lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm border-border bg-sidebar p-0">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <BrandMark />
          <SheetTitle className="text-sm font-semibold tracking-tight">AnchorSpace</SheetTitle>
        </div>
        <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-4" aria-label="Mobile">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="eyebrow mb-2 px-3">{group.title}</p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <SideLink item={item} onNavigate={() => setOpen(false)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {mobileTabs.map((tab) => (
          <li key={tab.to}>
            <Link
              to={tab.to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition"
              activeProps={{ className: "text-primary" }}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
