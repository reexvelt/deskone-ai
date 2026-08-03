import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FolderKanban,
  LibraryBig,
  Layers3,
  Minus,
  Send,
  Sparkles,
  Timer,
  Workflow,
  Quote,
} from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base leading-7 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

const problems = [
  "17 browser tabs to publish one post",
  "Files scattered across Drive, desktop and DMs",
  "Copy in one tool, design in another, schedule in a third",
  "No single place that remembers your brand",
];

export function ProblemSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <SectionHeading
            align="left"
            eyebrow="The problem"
            title="Professionals lose hours switching between apps."
            subtitle="The average creator or agency touches a dozen tools to ship a single deliverable. Context dies in the gaps between them — and so does the work."
          />
          <div className="mt-8 space-y-3">
            {problems.map((p) => (
              <div key={p} className="flex items-start gap-3 rounded-2xl border border-border bg-surface/50 p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                  <Minus className="h-3.5 w-3.5" />
                </span>
                <p className="min-w-0 text-sm text-muted-foreground">{p}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-destructive/10 blur-3xl" />
          <div className="relative grid grid-cols-2 gap-3 rounded-[2rem] border border-border bg-surface/60 p-4 backdrop-blur-xl sm:grid-cols-3 sm:p-6">
            {["Drive", "Canva", "Notion", "Slack", "IG", "WordPress", "CapCut", "Gmail", "Sheets"].map((t, i) => (
              <div
                key={t}
                className="flex h-20 items-center justify-center rounded-2xl border border-border bg-background/60 text-xs font-medium text-muted-foreground"
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              >
                {t}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-surface/50 px-4 py-3 text-xs text-muted-foreground">
            <Clock3 className="h-4 w-4 shrink-0 text-warning" />
            <span className="min-w-0">Average 9.4 hours per week lost to tool switching.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const solutionPoints = [
  {
    icon: Layers3,
    title: "Connect, don't replace",
    text: "Keep the tools your team already loves. AnchorSpace sits above them as the connective layer.",
  },
  {
    icon: BrainCircuit,
    title: "One shared memory",
    text: "Brand voice, client details, assets and knowledge live in one place every workflow can read.",
  },
  {
    icon: Workflow,
    title: "From idea to published",
    text: "Plan, create, approve and publish in a single continuous flow instead of six disconnected ones.",
  },
];

export function SolutionSection() {
  return (
    <section id="solution" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The solution"
          title="One intelligent workspace on top of your entire stack."
          subtitle="AnchorSpace is not another AI tool to add to the pile. It is the workspace that finally makes your existing tools work together."
        />
        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-6">
          {solutionPoints.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-3xl border border-border bg-surface/50 p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:bg-surface"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Sparkles, title: "AI Workspace", text: "Missions that plan the work, then execute with your approval." },
  { icon: FolderKanban, title: "Projects", text: "Every client, campaign and launch organized end to end." },
  { icon: CalendarDays, title: "Calendar", text: "Deadlines, shoots and publishing dates in one timeline." },
  { icon: LibraryBig, title: "Knowledge Base", text: "Docs, links and files your workspace can actually use." },
  { icon: Layers3, title: "Content Studio", text: "Upload media, generate captions, scripts and variations." },
  { icon: Send, title: "Publishing", text: "Push finished content straight to the platforms you use." },
  { icon: Timer, title: "Scheduling", text: "Queue content once and stay consistent for weeks." },
  { icon: Workflow, title: "Integrations", text: "Drive, Notion, Slack, WordPress, Meta, LinkedIn and more." },
  { icon: BrainCircuit, title: "Automation", text: "Repeatable workflows that run without babysitting." },
];

export function FeatureSection() {
  return (
    <section id="features" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Everything the work needs. Nothing it doesn't."
          subtitle="Nine deeply connected surfaces that replace a folder of bookmarks."
        />
        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-border bg-surface/40 p-6 transition hover:border-secondary/40 hover:bg-surface"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/12 text-secondary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="min-w-0 truncate text-base font-semibold tracking-tight">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const flow = [
  { label: "Create", text: "Upload media or write a brief" },
  { label: "Generate", text: "Captions, scripts, titles, variations" },
  { label: "Approve", text: "Review and refine in one pass" },
  { label: "Publish", text: "Ship to every connected platform" },
];

export function PublishingFlowSection() {
  return (
    <section id="workflow" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Workflow"
          title="Watch content travel from idea to published."
          subtitle="A single pipeline, visible end to end, with approval built in."
        />
        <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-border bg-surface/40 p-5 backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />
          <div className="pointer-events-none absolute left-0 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_18px_4px_color-mix(in_oklab,var(--color-primary)_60%,transparent)] lg:block animate-[flow_6s_linear_infinite]" />
          <div className="relative grid gap-4 lg:grid-cols-4">
            {flow.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-background/70 p-5 backdrop-blur"
                style={{ animation: `fade-in 0.6s ease-out ${i * 0.15}s both` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Step {i + 1}
                  </span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{s.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "I stopped living in fifteen tabs. Everything for every client now starts and ends in one workspace.",
    name: "Amara O.",
    role: "Freelance content strategist",
  },
  {
    quote:
      "The publishing flow alone gave our team back a full day each week. Approvals finally happen in one place.",
    name: "Daniel R.",
    role: "Founder, 6-person agency",
  },
  {
    quote:
      "It connects to what we already use instead of asking us to migrate. That is why it actually stuck.",
    name: "Priya S.",
    role: "Social media manager",
  },
];

export function TestimonialSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Loved by professionals" title="Built with the people doing the work." />
        <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex h-full flex-col rounded-3xl border border-border bg-surface/50 p-6">
              <Quote className="h-6 w-6 shrink-0 text-primary/70" />
              <blockquote className="mt-4 flex-1 text-sm leading-7 text-foreground/90">{t.quote}</blockquote>
              <figcaption className="mt-6 flex min-w-0 items-center gap-3 border-t border-border pt-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-secondary to-primary text-xs font-bold">
                  {t.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    text: "For getting organized.",
    perks: ["3 projects", "30 missions / month", "3 connected tools", "Core AI drafting"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Plus",
    price: "$12",
    period: "/month",
    text: "For solo professionals.",
    perks: ["10 projects", "300 missions / month", "10 connected tools", "Content Studio", "Scheduling"],
    cta: "Start Plus",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    text: "For busy creators.",
    perks: ["Unlimited projects", "Unlimited missions", "All integrations", "Automation workflows", "Priority processing"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "/month",
    text: "For teams and agencies.",
    perks: ["Everything in Pro", "Team seats & roles", "Client workspaces", "Approval workflows", "Priority support"],
    cta: "Talk to us",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans that scale with the work."
          subtitle="Start free. Upgrade when your workspace becomes the place everything happens."
        />
        <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex h-full flex-col rounded-3xl border p-6 ${
                p.featured
                  ? "border-primary/50 bg-surface shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--color-primary)_60%,transparent)]"
                  : "border-border bg-surface/40"
              }`}
            >
              {p.featured && (
                <span className="absolute right-5 top-5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Popular
                </span>
              )}
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="pb-1 text-xs text-muted-foreground">{p.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span className="min-w-0">{perk}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-6 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                  p.featured
                    ? "bg-gradient-to-r from-secondary to-primary text-foreground hover:opacity-90"
                    : "border border-border bg-background/60 text-foreground hover:bg-surface"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Is AnchorSpace just another AI tool?",
    a: "No. AnchorSpace is a workspace that connects the tools you already use — AI is one capability inside it, not the product itself.",
  },
  {
    q: "Do I have to move my files?",
    a: "No migration required. Connect Drive, Notion and the rest, and keep working where your content already lives.",
  },
  {
    q: "Which tools can I connect?",
    a: "Google Drive, Calendar, Gmail, Notion, Slack, WordPress, Canva, Instagram, Facebook, LinkedIn, TikTok, ElevenLabs, CapCut and more, with new connectors added continuously.",
  },
  {
    q: "Who is it built for?",
    a: "Digital marketers, freelancers, agencies, content creators and small teams who juggle multiple clients and platforms.",
  },
  {
    q: "Can I invite my team?",
    a: "Yes. Business plans include team seats, roles and client workspaces with approval workflows.",
  },
  {
    q: "Is my data secure?",
    a: "Every workspace is isolated with row-level security, encrypted connections and scoped access to any tool you connect.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        <div className="mt-12 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface/40">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 text-left transition hover:bg-surface/60 sm:px-6"
              >
                <span className="min-w-0 text-sm font-medium sm:text-base">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground sm:px-6">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface/60 px-6 py-14 text-center backdrop-blur-xl sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(600px_300px_at_50%_0%,color-mix(in_oklab,var(--color-secondary)_28%,transparent),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Start using AnchorSpace today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Bring your projects, clients, content and tools into one connected workspace. Free to start, no card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary px-7 text-sm font-semibold sm:w-auto"
              >
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border bg-background/60 px-7 text-sm font-semibold sm:w-auto"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const columns = [
    { title: "Product", links: ["Features", "Workflow", "Pricing", "Integrations"] },
    { title: "Use cases", links: ["Freelancers", "Agencies", "Creators", "Marketing teams"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Changelog"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-base font-black">
                A
              </span>
              <span className="text-base font-semibold tracking-tight">AnchorSpace</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Your entire digital workspace, connected. Projects, content, clients and tools in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title} className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <span className="cursor-default text-sm text-muted-foreground transition hover:text-foreground">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} AnchorSpace. All rights reserved.</span>
          <span>Built for professionals who ship.</span>
        </div>
      </div>
    </footer>
  );
}
