
import { Link, Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Command,
  FolderKanban,
  Home,
  Layers3,
  Menu,
  MicVocal,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  SquareTerminal,
  UploadCloud,
  Settings,
  Bell,
  Search,
  UserCircle2,
  LibraryBig,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const navigation = [
  { label: "Home", to: "/home", icon: Home },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Missions", to: "/missions", icon: Command },
  { label: "Studio", to: "/studio", icon: Sparkles },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Knowledge", to: "/knowledge", icon: LibraryBig },
  { label: "Integrations", to: "/integrations", icon: Layers3 },
  { label: "AI Models", to: "/ai-models", icon: SquareTerminal },
  { label: "API Keys", to: "/api-keys", icon: UploadCloud },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Profile", to: "/profile", icon: UserCircle2 },
  { label: "Settings", to: "/settings", icon: Settings },
];

function AppLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/login", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#090B10] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-white">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#0D1016]/95 backdrop-blur-xl transition-all duration-300 lg:flex ${
            collapsed ? "w-[88px]" : "w-[290px]"
          }`}
        >
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
              <Link to="/home" className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#3AA7FF] shadow-[0_0_25px_rgba(124,92,255,0.28)]">
                  <span className="text-lg font-black">A</span>
                </div>
                {!collapsed && (
                  <div>
                    <p className="text-sm font-semibold tracking-[0.25em] text-white/70">ANCHORSPACE</p>
                    <p className="text-xs text-white/40">Create. Connect. Command.</p>
                  </div>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <div className="px-4 py-4">
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3AA7FF]/20">
                    <Sparkles className="h-5 w-5 text-white/80" />
                  </div>
                  {!collapsed && (
                    <div>
                      <p className="text-sm font-medium">Good evening,</p>
                      <p className="text-sm text-white/50">Welcome back</p>
                    </div>
                  )}
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                    activeProps={{
                      className:
                        "bg-gradient-to-r from-[#7C5CFF]/20 to-[#3AA7FF]/15 text-white border border-white/10",
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto border-t border-white/10 p-4">
              <div className={`rounded-3xl border border-white/10 bg-white/5 p-4 ${collapsed ? "text-center" : ""}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-white/35">Workspace</p>
                {!collapsed && (
                  <>
                    <p className="mt-2 text-sm font-semibold">AnchorSpace V1</p>
                    <p className="mt-1 text-xs leading-6 text-white/45">
                      Premium creator workspace for missions, content, and projects.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex min-h-screen flex-1 flex-col ${collapsed ? "lg:pl-[88px]" : "lg:pl-[290px]"}`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090B10]/85 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <Search className="h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search projects, missions, files..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
              </div>

              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80">
                <Bell className="h-5 w-5" />
              </button>

              <Link
                to="/profile"
                className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 sm:flex"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#3AA7FF] font-semibold">
                  A
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">AnchorSpace</p>
                  <p className="text-xs text-white/45">Creator workspace</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-white/10 bg-[#0D1016] p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <Link to="/home" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#3AA7FF]">
                  <span className="text-lg font-black">A</span>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.25em] text-white/70">ANCHORSPACE</p>
                  <p className="text-xs text-white/40">Create. Connect. Command.</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                  activeProps={{
                    className:
                      "bg-gradient-to-r from-[#7C5CFF]/20 to-[#3AA7FF]/15 text-white border border-white/10",
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

