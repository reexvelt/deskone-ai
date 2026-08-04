import { supabase } from "@/integrations/supabase/client";

const PENDING_KEY = "anchorspace.referral.pending";

export function storePendingReferral(code: string) {
  try {
    localStorage.setItem(PENDING_KEY, code.trim().toUpperCase());
  } catch {
    /* storage unavailable */
  }
}

export function readPendingReferral(): string | null {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function clearPendingReferral() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function referralLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://anchorspace.app";
  return `${origin}/ref/${code}`;
}

export interface WalletSnapshot {
  referralCode: string;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  creditsEarned: number;
  creditsPurchased: number;
  commissionCents: number;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  kind: string;
  description: string;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  status: string;
  referrer_id: string;
  referred_user_id: string;
  referrer_credits_awarded: number;
  commission_cents: number;
  commission_paid_at: string | null;
  created_at: string;
}

export async function fetchWallet(userId: string): Promise<WalletSnapshot | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code, credits_total, credits_used, credits_earned, credits_purchased, commission_cents")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const total = data.credits_total ?? 0;
  const used = data.credits_used ?? 0;
  return {
    referralCode: data.referral_code ?? "",
    creditsTotal: total,
    creditsUsed: used,
    creditsRemaining: Math.max(0, total - used),
    creditsEarned: data.credits_earned ?? 0,
    creditsPurchased: data.credits_purchased ?? 0,
    commissionCents: data.commission_cents ?? 0,
  };
}

export async function fetchCreditHistory(userId: string): Promise<CreditTransaction[]> {
  const { data } = await supabase
    .from("credit_transactions")
    .select("id, amount, kind, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function fetchMyReferrals(userId: string): Promise<ReferralRow[]> {
  const { data } = await supabase
    .from("referrals")
    .select("id, status, referrer_id, referred_user_id, referrer_credits_awarded, commission_cents, commission_paid_at, created_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export interface RewardConfig {
  referrerCredits: number;
  inviteeCredits: number;
  commissionPercent: number;
}

export async function fetchRewardConfig(): Promise<RewardConfig> {
  const { data } = await supabase
    .from("reward_settings")
    .select("referrer_credits, invitee_credits, commission_percent")
    .eq("id", true)
    .maybeSingle();
  return {
    referrerCredits: data?.referrer_credits ?? 300,
    inviteeCredits: data?.invitee_credits ?? 100,
    commissionPercent: Number(data?.commission_percent ?? 30),
  };
}

export async function fetchSubscription(userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, billing_interval, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
