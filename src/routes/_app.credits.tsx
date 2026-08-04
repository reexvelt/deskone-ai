import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  fetchCreditHistory,
  fetchSubscription,
  fetchWallet,
  type CreditTransaction,
  type WalletSnapshot,
} from "@/lib/referrals";
import { planById } from "@/lib/plans";
import { ArrowUpRight, Coins, Gift, Loader2, ShoppingCart, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/credits")({
  head: () => ({
    meta: [
      { title: "Credits Wallet — AI Usage & Balance · AnchorSpace" },
      {
        name: "description",
        content: "Track your AnchorSpace AI credits: balance, usage, referral rewards, purchases and full history.",
      },
      { property: "og:title", content: "Credits Wallet — AI Usage & Balance · AnchorSpace" },
      {
        property: "og:description",
        content: "See exactly where your AI credits came from and where they went.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreditsPage,
});

const KIND_LABELS: Record<string, string> = {
  welcome_bonus: "Welcome bonus",
  referral_bonus: "Referral bonus",
  purchase: "Credits purchased",
  usage: "AI usage",
  adjustment: "Adjustment",
};

function CreditsPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const [w, h, sub] = await Promise.all([
      fetchWallet(user.id),
      fetchCreditHistory(user.id),
      fetchSubscription(user.id),
    ]);
    setWallet(w);
    setHistory(h);
    if (sub?.plan) setPlan(sub.plan);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const total = wallet?.creditsTotal ?? 0;
  const used = wallet?.creditsUsed ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const currentPlan = planById(plan);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Wallet</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Credits</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            On the {currentPlan.name} plan — {currentPlan.credits}.
          </p>
        </div>
        <Link
          to="/pricing"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-gradient-to-r from-secondary to-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Get more credits <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <section className="rounded-3xl border border-border bg-surface/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Available credits</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{wallet?.creditsRemaining ?? 0}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {used} of {total} used
          </p>
        </div>
        <div
          className="mt-5 h-2 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Credit usage"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={Coins} label="Total credits" value={total} />
        <Tile icon={Zap} label="Credits used" value={used} />
        <Tile icon={Gift} label="Earned from referrals" value={wallet?.creditsEarned ?? 0} />
        <Tile icon={ShoppingCart} label="Credits purchased" value={wallet?.creditsPurchased ?? 0} />
      </section>

      <section className="rounded-3xl border border-border bg-surface/60">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight">Credit history</h2>
        </div>
        {history.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Coins className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium">No credit activity yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
              Run a mission or invite a teammate — every credit movement shows up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {history.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{KIND_LABELS[tx.kind] ?? tx.kind}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {tx.description || new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${tx.amount >= 0 ? "text-success" : "text-muted-foreground"}`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  );
}
