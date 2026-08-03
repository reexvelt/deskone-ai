import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  FaqSection,
  FeatureSection,
  FinalCta,
  LandingFooter,
  PricingSection,
  ProblemSection,
  PublishingFlowSection,
  SolutionSection,
  TestimonialSection,
} from "@/components/landing-sections";
import { ArrowRight, Menu, PlayCircle, ShieldCheck, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnchorSpace — Your Entire Digital Workspace. Connected." },
      {
        name: "description",
        content:
          "AnchorSpace connects the tools digital professionals already use into one intelligent workspace: projects, content, clients, publishing and scheduling.",
      },
      { property: "og:title", content: "AnchorSpace — Your Entire Digital Workspace. Connected." },
      {
        property: "og:description",
        content:
          "Manage projects, create content, connect your favorite tools, organize clients and publish everywhere — from one intelligent workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const integrations: { name: string; short: string; from: string; to: string }[] = [
  { name: "ChatGPT", short: "GPT", from: "#10A37F", to: "#0E7C61" },
  { name: "Claude", short: "CL", from: "#D97757", to: "#B45E42" },
  { name: "Gemini", short: "GM", from: "#4285F4", to: "#8E7CFF" },
  { name: "Canva", short: "CV", from: "#00C4CC", to: "#7D2AE8" },
  { name: "Google Drive", short: "DR", from: "#FFCF63", to: "#34A853" },
  { name: "Instagram", short: "IG", from: "#E1306C", to: "#F77737" },
  { name: "Facebook", short: "FB", from: "#1877F2", to: "#0B5FCC" },
  { name: "LinkedIn", short: "IN", from: "#0A66C2", to: "#084E96" },
  { name: "WordPress", short: "WP", from: "#21759B", to: "#464342" },
  { name: "Notion", short: "NO", from: "#FFFFFF", to: "#9CA3AF" },
  { name: "Slack", short: "SL", from: "#36C5F0", to: "#E01E5A" },
  { name: "ElevenLabs", short: "EL", from: "#A78BFA", to: "#6D28D9" },
  { name: "CapCut", short: "CC", from: "#00E0D3", to: "#0B84FF" },
];

const navLinks = [
  { label: "Solution", href: "#solution" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function LandingPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-sm font-black shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--color-secondary)_70%,transparent)]">
              A
            </span>
            <span className="truncate text-[15px] font-semibold tracking-tight">AnchorSpace</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition hover:bg-surface/70 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-secondary to-primary px-4 text-sm font-semibold transition hover:opacity-90"
            >
              Start Free
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-border bg-background/95 px-4 py-3 lg:hidden">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-1 block rounded-xl px-3 py-3 text-sm font-medium"
            >
              Sign in
            </Link>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-secondary/20 blur-[120px]" />
          <div className="absolute right-[-8rem] top-[8rem] h-[24rem] w-[24rem] rounded-full bg-primary/15 blur-[110px]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            One workspace for every tool you already use
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-[2.25rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Your Entire Digital Workspace.{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Connected.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Manage projects. Create content. Connect your favorite tools. Organize clients. Publish everywhere.
            All from one intelligent workspace.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-7 text-sm font-semibold shadow-[0_20px_50px_-20px_color-mix(in_oklab,var(--color-primary)_80%,transparent)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#workflow"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface/50 px-7 text-sm font-semibold backdrop-blur transition hover:bg-surface sm:w-auto"
            >
              <PlayCircle className="h-4 w-4" /> Watch Demo
            </a>
          </div>

          <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> No credit card required · Free plan forever
          </p>

          <IntegrationOrbit />
        </div>
      </section>

      <ProblemSection />
      <SolutionSection />
      <FeatureSection />
      <PublishingFlowSection />
      <TestimonialSection />
      <PricingSection />
      <FaqSection />
      <FinalCta />
      <LandingFooter />
    </main>
  );
}

function IntegrationOrbit() {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
      {/* Connection lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 800 420"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[80, 200, 320, 480, 600, 720].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={i % 2 === 0 ? 60 : 360}
            x2={400}
            y2={210}
            stroke="color-mix(in oklab, var(--color-primary) 45%, transparent)"
            strokeWidth="1"
            strokeDasharray="4 6"
            style={{ animation: `orbit-pulse ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </svg>

      <div className="relative rounded-[2rem] border border-border bg-surface/40 p-5 backdrop-blur-xl sm:p-10">
        <div className="mx-auto mb-8 flex max-w-xs flex-col items-center rounded-3xl border border-primary/30 bg-background/70 px-6 py-5 text-center shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--color-primary)_70%,transparent)]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-lg font-black">
            A
          </span>
          <p className="mt-3 text-sm font-semibold tracking-tight">AnchorSpace</p>
          <p className="mt-1 text-xs text-muted-foreground">The connective layer</p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-4 lg:grid-cols-7">
          {integrations.map((t, i) => (
            <div
              key={t.name}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background/60 px-2 py-3.5 text-center transition hover:border-primary/40"
              style={{ animation: `float-y ${4 + (i % 5) * 0.6}s ease-in-out ${i * 0.15}s infinite` }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-background"
                style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
              >
                {t.short}
              </span>
              <span className="w-full truncate text-[10px] text-muted-foreground sm:text-[11px]">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
