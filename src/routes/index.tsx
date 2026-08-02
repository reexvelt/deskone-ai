import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  Cloud,
  Command,
  FolderKanban,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnchorSpace · The AI Execution Workspace" },
      { name: "description", content: "AnchorSpace turns goals into missions: it plans the work, you approve it, and your connected apps execute." },
      { property: "og:title", content: "AnchorSpace · The AI Execution Workspace" },
      { property: "og:description", content: "AnchorSpace turns goals into missions: it plans the work, you approve it, and your connected apps execute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Command,
    title: "Mission Center",
    desc: "Turn ideas into structured missions with progress, outputs, and approval steps.",
  },
  {
    icon: WandSparkles,
    title: "Content Studio",
    desc: "Upload video, audio, images, and notes, then generate captions, scripts, and post-ready assets.",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    desc: "Organize every client, campaign, or idea inside one clean, connected workspace.",
  },
  {
    icon: Cloud,
    title: "Connected Apps",
    desc: "Bring together Drive, Calendar, Gmail, YouTube, and more when you are ready.",
  },
  {
    icon: CalendarDays,
    title: "Smart Calendar",
    desc: "Track deadlines, publishing schedules, and content plans in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Workspace Memory",
    desc: "Save preferences, style, brand notes, and reusable context for future missions.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create a project",
    text: "Start with a client, brand, or content idea.",
  },
  {
    number: "02",
    title: "Add a mission",
    text: "Define the goal and let AnchorSpace organize the workflow.",
  },
  {
    number: "03",
    title: "Upload content",
    text: "Drop in video, audio, images, or documents.",
  },
  {
    number: "04",
    title: "Generate and approve",
    text: "Create captions, scripts, titles, and publishing assets.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    badge: "Starter",
    perks: ["30 missions / month", "3 projects", "3 connected apps", "Basic AI tools", "Ads supported"],
  },
  {
    name: "Plus",
    price: "$12.99",
    badge: "Popular",
    perks: ["More missions", "More storage", "Reduced ads", "Better AI tools", "Content Studio access"],
  },
  {
    name: "Pro",
    price: "$29.99",
    badge: "Best Value",
    perks: ["No ads", "Advanced automation", "Premium AI", "Unlimited projects", "Priority processing"],
  },
];

const faqs = [
  {
    q: "What is AnchorSpace?",
    a: "AnchorSpace is an AI-powered workspace for creators, freelancers, and creative teams to organize projects, generate content, and manage work in one place.",
  },
  {
    q: "Is this only for content creators?",
    a: "Content creators are the first focus, but freelancers, marketers, and small teams can also use it to manage client work and content workflows.",
  },
  {
    q: "Will I be able to connect my apps?",
    a: "Yes. The first version is designed around connected workflows, starting with the most useful tools and expanding over time.",
  },
  {
    q: "Is AnchorSpace another AI chatbot?",
    a: "No. It is built to help users complete work with missions, projects, uploads, approvals, and content workflows.",
  },
];

function LandingPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (user) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
        <div className="absolute right-[-10%] top-[15%] h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[30%] h-80 w-80 rounded-full bg-success/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-border bg-surface/60 px-4 py-3 backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-primary shadow-[0_0_30px_rgba(124,92,255,0.35)]">
              <span className="text-lg font-black">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.3em] text-muted-foreground">ANCHORSPACE</p>
              <p className="text-xs text-muted-foreground">Create. Connect. Command.</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-foreground">
              Workflow
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="transition hover:text-foreground">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-border hover:bg-surface/60"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_30px_rgba(58,167,255,0.18)] transition hover:translate-y-[-1px]"
            >
              Get Early Access <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-foreground backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              Launching soon for creators and freelancers
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              The intelligent workspace for creators and freelancers.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Plan projects. Create content. Organize files. Generate AI-powered ideas. Manage clients.
              Publish with confidence — all from one premium workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-6 py-3 text-sm font-semibold text-foreground shadow-[0_15px_40px_rgba(124,92,255,0.25)] transition hover:translate-y-[-2px]"
              >
                Get Early Access <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#workflow"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-surface"
              >
                <PlayCircle className="h-4 w-4" />
                See how it works
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Creators", "Content-first"],
                ["Freelancers", "Client-ready"],
                ["Projects", "All in one"],
                ["AI", "Mission-based"],
              ].map(([title, sub]) => (
                <div key={title} className="rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface/90 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">AnchorSpace Studio</p>
                  <p className="text-xs text-muted-foreground">Mission command for modern creators</p>
                </div>
                <div className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
                  Live workspace
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-3xl border border-border bg-surface/60 p-5">
                  <p className="text-sm text-muted-foreground">What would you like to accomplish today?</p>
                  <div className="mt-4 rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
                    Create a YouTube video about meal prep, generate captions, save to Drive, and schedule it
                    for Friday.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Generate script", "Create captions", "Save assets", "Schedule publish"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Mission progress", "72%", Zap],
                    ["Connected apps", "4 active", BadgeCheck],
                    ["Files organized", "18 assets", Upload],
                    ["Next publish", "Friday 6 PM", CalendarDays],
                  ].map(([label, value, Icon]) => (
                    <div key={label as string} className="rounded-2xl border border-border bg-surface/60 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label as string}</p>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="mt-4 text-xl font-bold">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Built to reduce switching, save time, and keep work moving.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-border bg-surface/50 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur transition hover:-translate-y-1 hover:border-border"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Workflow</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One workspace. One flow. Everything connected.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="rounded-[1.75rem] border border-border bg-surface/50 p-6">
                <p className="text-xs font-semibold tracking-[0.4em] text-muted-foreground">{step.number}</p>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple plans for creators at every stage.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[2rem] border p-7 backdrop-blur ${
                  plan.name === "Plus"
                    ? "border-secondary/35 bg-secondary/10 shadow-[0_0_50px_rgba(124,92,255,0.12)]"
                    : "border-border bg-surface/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <span className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
                    {plan.badge}
                  </span>
                </div>
                <p className="mt-5 text-4xl font-black">
                  {plan.price}
                  <span className="text-sm font-medium text-muted-foreground"> / month</span>
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4 text-emerald-400" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    plan.name === "Plus"
                      ? "bg-foreground text-background hover:bg-foreground"
                      : "border border-border bg-surface/60 text-foreground hover:bg-surface"
                  }`}
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="py-10">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions creators will ask before they join.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-[1.75rem] border border-border bg-surface/50 p-6">
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="rounded-[2.25rem] border border-border bg-gradient-to-r from-secondary/20 via-surface/50 to-primary/20 p-8 text-center backdrop-blur-xl sm:p-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Launching soon
            </p>
            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
              Ready to create without the chaos?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Join the first creators building with AnchorSpace and experience a workspace designed to help you stay
              organized, create faster, and command your workflow from one place.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground"
              >
                Get Early Access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border py-8 text-sm text-muted-foreground">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} AnchorSpace. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <a href="#features" className="transition hover:text-muted-foreground">
                Features
              </a>
              <a href="#pricing" className="transition hover:text-muted-foreground">
                Pricing
              </a>
              <a href="#faq" className="transition hover:text-muted-foreground">
                FAQ
              </a>
              <Link to="/login" className="transition hover:text-muted-foreground">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
