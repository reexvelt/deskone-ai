import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { activateSubscription } from "@/lib/referrals.functions";
import { fetchSubscription } from "@/lib/referrals";
import { PLANS, monthlyEquivalent, yearlySavings, type BillingInterval, type Plan } from "@/lib/plans";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Plans for Every Creator · AnchorSpace" },
      {
        name: "description",
        content:
          "Simple AnchorSpace pricing: Free, Plus, Pro and Business plans with monthly or yearly billing, AI credits, publishing and team collaboration.",
      },
      { property: "og:title", content: "Pricing — Plans for Every Creator · AnchorSpace" },
      {
        property: "og:description",
        content: "Choose the AnchorSpace plan that fits — from a free workspace to a full multi-user agency setup.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [pending, setPending] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  useEffect(() => {
    if (!ready || !user) return;
    void fetchSubscription(user.id).then((sub) => {
      if (sub?.plan) setCurrentPlan(sub.plan);
    });
  }, [ready, user]);

  async function choose(plan: Plan) {
    if (!user) {
      navigate({ to: "/register" });
      return;
    }
    if (plan.id === "free") {
      toast.info("You're already on the Free workspace.");
      return;
    }
    setPending(plan.id);
    try {
      const amount = interval === "monthly" ? plan.monthly : plan.yearly;
      await activateSubscription({
        data: { plan: plan.id, interval, amountCents: amount * 100, provider: null },
      });
      setCurrentPlan(plan.id);
      toast.success(`${plan.name} activated. Enjoy the extra credits.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout");
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-secondary to-primary text-sm font-black">
              A
            </span>
            <span className="text-sm font-semibold tracking-tight">AnchorSpace</span>
          </Link>
          <Link
            to={user ? "/home" : "/login"}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {user ? "Back to workspace" : "Sign in"}
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-14rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-secondary/20 blur-[130px]" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="eyebrow">Pricing</p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            One workspace.{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Every plan scales with you.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Start free, upgrade when your output grows. Every plan includes the full workspace, connected tools and
            publishing.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface/60 p-1">
            {(["monthly", "yearly"] as BillingInterval[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setInterval(value)}
                aria-pressed={interval === value}
                className={`min-h-11 rounded-full px-5 text-sm font-medium capitalize transition ${
                  interval === value
                    ? "bg-gradient-to-r from-secondary to-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value}
                {value === "yearly" && <span className="ml-2 text-xs opacity-80">save 20%</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const price = monthlyEquivalent(plan, interval);
            const isCurrent = currentPlan === plan.id;
            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-6 transition ${
                  plan.highlight
                    ? "border-primary/45 bg-surface/80 shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--color-primary)_60%,transparent)]"
                    : "border-border bg-surface/50"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-secondary to-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> {plan.badge}
                  </span>
                )}
                <h2 className="text-lg font-semibold tracking-tight">{plan.name}</h2>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{plan.tagline}</p>

                <div className="mt-6 flex items-end gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">${price}</span>
                  <span className="pb-1 text-xs text-muted-foreground">/ month</span>
                </div>
                {interval === "yearly" && plan.monthly > 0 && (
                  <p className="mt-1.5 text-xs text-success">
                    Billed ${plan.yearly}/year — save ${yearlySavings(plan)}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-primary">{plan.credits}</p>

                <Button
                  type="button"
                  disabled={pending === plan.id || isCurrent}
                  onClick={() => choose(plan)}
                  className={`mt-6 h-12 w-full rounded-full text-sm font-semibold ${
                    plan.highlight
                      ? "bg-gradient-to-r from-secondary to-primary"
                      : "border border-border bg-surface-2 text-foreground hover:bg-surface"
                  }`}
                >
                  {pending === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : plan.id === "free" ? "Start free" : `Choose ${plan.name}`}
                </Button>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-success" />
                      <span className="min-w-0">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-6 text-muted-foreground">
          Card payments are processed by Stripe worldwide and Paystack across Africa. Prices in USD, excluding local
          taxes. Cancel any time from Settings.
        </p>
      </section>
    </main>
  );
}
