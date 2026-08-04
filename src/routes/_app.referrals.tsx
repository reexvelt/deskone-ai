import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  fetchMyReferrals,
  fetchRewardConfig,
  fetchWallet,
  formatCurrency,
  referralLink,
  type ReferralRow,
  type RewardConfig,
  type WalletSnapshot,
} from "@/lib/referrals";
import { Check, Copy, Gift, Loader2, Share2, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals — Invite & Earn Credits · AnchorSpace" },
      {
        name: "description",
        content: "Share your AnchorSpace referral link to earn AI credits and commission on every member you invite.",
      },
      { property: "og:title", content: "Referrals — Invite & Earn Credits · AnchorSpace" },
      {
        property: "og:description",
        content: "Track referrals, credits earned and commission from one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [config, setConfig] = useState<RewardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [w, r, c] = await Promise.all([fetchWallet(user.id), fetchMyReferrals(user.id), fetchRewardConfig()]);
    setWallet(w);
    setRows(r);
    setConfig(c);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const link = wallet?.referralCode ? referralLink(wallet.referralCode) : "";

  useEffect(() => {
    if (!link || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, link, {
      width: 176,
      margin: 1,
      color: { dark: "#FFFFFF", light: "#00000000" },
    });
  }, [link]);

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed — select and copy the link manually");
    }
  }

  async function share() {
    if (!link) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "AnchorSpace", text: "Join my AnchorSpace workspace", url: link });
        return;
      } catch {
        /* user dismissed */
      }
    }
    void copy();
  }

  const rewarded = rows.filter((r) => r.status === "rewarded");
  const pending = rows.filter((r) => r.status !== "rewarded");
  const creditsFromReferrals = rows.reduce((sum, r) => sum + r.referrer_credits_awarded, 0);
  const commissionCents = rows.reduce((sum, r) => sum + r.commission_cents, 0);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Referrals</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Invite people. Earn credits.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          You earn <span className="font-medium text-foreground">{config?.referrerCredits ?? 300} AI credits</span> for
          every member who verifies their email, plus{" "}
          <span className="font-medium text-foreground">{config?.commissionPercent ?? 30}% commission</span> on their
          first paid subscription. They start with {config?.inviteeCredits ?? 100} welcome credits.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-surface/60 p-5 sm:p-6">
          <p className="eyebrow">Your referral link</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-2 px-4 py-3.5">
              <p className="truncate text-sm text-foreground">{link || "—"}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={copy}
                className="h-12 flex-1 rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold sm:flex-none sm:px-6"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={share}
                className="h-12 rounded-full border-border bg-surface/60 px-4"
                aria-label="Share referral link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Code <span className="font-mono font-medium text-foreground">{wallet?.referralCode}</span> — also works at{" "}
            <span className="font-mono">/invite/{wallet?.referralCode}</span>
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={Users} label="Total referrals" value={rows.length} />
            <Stat icon={Check} label="Successful" value={rewarded.length} tone="success" />
            <Stat icon={Loader2} label="Pending" value={pending.length} tone="warning" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-surface/60 p-6">
          <p className="eyebrow self-start">Scan to join</p>
          <canvas ref={canvasRef} className="rounded-2xl" aria-label="Referral QR code" />
          <p className="text-center text-xs leading-5 text-muted-foreground">
            Point a phone camera here to open your invite link.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Gift} label="Credits earned from referrals" value={Math.max(creditsFromReferrals, wallet?.creditsEarned ?? 0)} big />
        <Stat icon={TrendingUp} label="Commission earned" value={formatCurrency(Math.max(commissionCents, wallet?.commissionCents ?? 0))} big />
        <Stat icon={Gift} label="Total available credits" value={wallet?.creditsRemaining ?? 0} big />
      </section>

      <section className="rounded-3xl border border-border bg-surface/60">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold tracking-tight">Referral activity</h2>
        </div>
        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-medium">No referrals yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
              Share your link with one person today — credits land the moment they verify their email.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Member {row.referred_user_id.slice(0, 8)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Joined {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                    row.status === "rewarded"
                      ? "bg-success/12 text-success"
                      : "bg-warning/12 text-warning"
                  }`}
                >
                  {row.status}
                </span>
                <span className="text-xs text-muted-foreground">+{row.referrer_credits_awarded} credits</span>
                {row.commission_cents > 0 && (
                  <span className="text-xs font-medium text-primary">{formatCurrency(row.commission_cents)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs leading-6 text-muted-foreground">
        Rewards apply once per invited member, only after email verification. Self-referrals and duplicate accounts are
        not rewarded.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
  big,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "success" | "warning";
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2/60 p-4">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          tone === "success"
            ? "bg-success/12 text-success"
            : tone === "warning"
              ? "bg-warning/12 text-warning"
              : "bg-primary/12 text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className={`mt-3 font-semibold tracking-tight ${big ? "text-2xl" : "text-xl"}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  );
}
