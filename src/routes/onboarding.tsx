import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchOnboarding, markOnboardedLocally, saveOnboarding } from "@/lib/onboarding";
import { Logo } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your workspace · AnchorSpace" },
      { name: "description", content: "Answer a few questions so AnchorSpace can tailor your workspace to how you work." },
      { property: "og:title", content: "Set up your workspace · AnchorSpace" },
      { property: "og:description", content: "Answer a few questions so AnchorSpace can tailor your workspace to how you work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const ROLES = [
  "Digital Marketer", "Freelancer", "Agency", "Business Owner", "Content Creator",
  "Designer", "Developer", "Video Editor", "Social Media Manager", "Student", "Other",
];

const USE_CASES = [
  "Managing Clients", "Marketing", "Content Creation", "Publishing",
  "Project Management", "Automation", "AI Productivity", "Team Collaboration",
];

const TOOLS = [
  "ChatGPT", "Claude", "Gemini", "Canva", "CapCut", "Google Drive", "Notion", "Slack",
  "WordPress", "Instagram", "Facebook", "LinkedIn", "TikTok", "Meta Business Suite", "ElevenLabs", "Other",
];

const SOURCES = ["Instagram", "Facebook", "LinkedIn", "TikTok", "Google", "YouTube", "Friend", "Reddit", "Product Hunt", "Other"];

const CHALLENGE_HINTS = [
  "Managing clients", "Creating content", "Keeping projects organized",
  "Publishing consistently", "Finding files", "Managing multiple tools",
];

const TOTAL = 7;

function OnboardingPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);

  const [role, setRole] = useState<string>("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [source, setSource] = useState<string>("");
  const [challenge, setChallenge] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    let active = true;
    fetchOnboarding(user.id).then((answers) => {
      if (!active) return;
      if (answers?.completed) {
        markOnboardedLocally(user.id);
        navigate({ to: "/home", replace: true });
        return;
      }
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [ready, user, navigate]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const canContinue = useMemo(() => {
    if (step === 1) return role !== "";
    if (step === 2) return useCases.length > 0;
    if (step === 3) return tools.length > 0;
    if (step === 4) return source !== "";
    return true;
  }, [step, role, useCases, tools, source]);

  async function finish() {
    if (!user) return;
    setSaving(true);
    try {
      await saveOnboarding(user.id, {
        completed: true,
        role,
        useCases,
        tools,
        source,
        challenge: challenge.trim(),
        completedAt: new Date().toISOString(),
      });
      markOnboardedLocally(user.id);
      setStep(6);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your answers");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || checking) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-14rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-secondary/20 blur-[120px]" />
        <div className="absolute bottom-[-12rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-primary/15 blur-[110px]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        <div className="flex items-center gap-2.5 py-2">
          <Logo size={32} />
          <span className="text-sm font-semibold tracking-tight">AnchorSpace</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Step {Math.min(step + 1, TOTAL)} of {TOTAL}
          </span>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
            style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
          />
        </div>

        <div key={step} className="flex flex-1 flex-col justify-center py-8" style={{ animation: "fade-in 0.4s ease-out both" }}>
          {step === 0 && (
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-secondary to-primary text-2xl font-black">
                A
              </span>
              <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to AnchorSpace</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Let's tailor your workspace. Six quick questions — under a minute — and we'll shape your projects,
                content studio and integrations around how you actually work.
              </p>
            </div>
          )}

          {step === 1 && (
            <Question title="What best describes you?" hint="Pick the one closest to your day-to-day.">
              <ChoiceGrid options={ROLES} selected={role ? [role] : []} onSelect={setRole} />
            </Question>
          )}

          {step === 2 && (
            <Question title="What will you primarily use AnchorSpace for?" hint="Select all that apply.">
              <ChoiceGrid options={USE_CASES} selected={useCases} onSelect={(v) => toggle(useCases, setUseCases, v)} multi />
            </Question>
          )}

          {step === 3 && (
            <Question title="Which tools do you already use?" hint="We'll prioritize these integrations for you.">
              <ChoiceGrid options={TOOLS} selected={tools} onSelect={(v) => toggle(tools, setTools, v)} multi />
            </Question>
          )}

          {step === 4 && (
            <Question title="How did you hear about AnchorSpace?" hint="This helps us reach more people like you.">
              <ChoiceGrid options={SOURCES} selected={source ? [source] : []} onSelect={setSource} />
            </Question>
          )}

          {step === 5 && (
            <Question title="What's your biggest challenge right now?" hint="Optional, but it makes your workspace smarter.">
              <div className="mb-3 flex flex-wrap gap-2">
                {CHALLENGE_HINTS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setChallenge((c) => (c ? `${c} ${h}.` : `${h}.`))}
                    className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    {h}
                  </button>
                ))}
              </div>
              <Textarea
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                rows={6}
                placeholder="Tell us what slows you down most…"
                className="min-h-[9rem] rounded-2xl border-border bg-surface/50 text-base"
              />
            </Question>
          )}

          {step === 6 && (
            <div className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-success/15 text-success">
                <PartyPopper className="h-7 w-7" />
              </span>
              <h1 className="mt-7 text-3xl font-semibold tracking-tight sm:text-4xl">Workspace ready 🎉</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                Your workspace has been prepared with your projects, content studio and recommended integrations.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 -mx-5 border-t border-border bg-background/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
          <div className="flex items-center gap-3">
            {step > 0 && step < 6 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="h-12 rounded-full px-4 text-sm"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
            )}
            {step === 6 ? (
              <Button
                onClick={() => navigate({ to: "/home", replace: true })}
                className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
              >
                Enter Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : step === 5 ? (
              <Button
                onClick={finish}
                disabled={saving}
                className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
              >
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Finish setup
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
                className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
              >
                {step === 0 ? "Get started" : "Continue"} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Question({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function ChoiceGrid({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: string[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(o)}
            className={`grid min-h-[3.25rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
              active
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border bg-surface/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span className="min-w-0 truncate">{o}</span>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center border transition ${multi ? "rounded-md" : "rounded-full"} ${
                active ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {active && <Check className="h-3 w-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
