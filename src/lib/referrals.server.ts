// Server-only referral + credits logic. Never imported by client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface RewardSettings {
  referrer_credits: number;
  invitee_credits: number;
  commission_percent: number;
}

export async function loadRewardSettings(): Promise<RewardSettings> {
  const { data } = await supabaseAdmin
    .from("reward_settings")
    .select("referrer_credits, invitee_credits, commission_percent")
    .eq("id", true)
    .maybeSingle();
  return {
    referrer_credits: data?.referrer_credits ?? 300,
    invitee_credits: data?.invitee_credits ?? 100,
    commission_percent: Number(data?.commission_percent ?? 30),
  };
}

/** Adds credits to a user's wallet and writes a history entry. */
export async function grantCredits(
  userId: string,
  amount: number,
  kind: "welcome_bonus" | "referral_bonus" | "purchase" | "adjustment",
  description: string,
  meta: Record<string, unknown> = {},
) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("credits_total, credits_earned, credits_purchased")
    .eq("id", userId)
    .maybeSingle();

  const isReferralCredit = kind === "welcome_bonus" || kind === "referral_bonus";
  await supabaseAdmin
    .from("profiles")
    .update({
      credits_total: (profile?.credits_total ?? 0) + amount,
      credits_earned: (profile?.credits_earned ?? 0) + (isReferralCredit ? amount : 0),
      credits_purchased: (profile?.credits_purchased ?? 0) + (kind === "purchase" ? amount : 0),
    })
    .eq("id", userId);

  await supabaseAdmin.from("credit_transactions").insert({
    user_id: userId,
    amount,
    kind,
    description,
    meta: meta as never,
  });
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const user = data?.user;
  if (!user) return false;
  // Email/password users need a confirmation; OAuth identities arrive verified.
  if (user.email_confirmed_at) return true;
  return (user.identities ?? []).some((i) => i.provider !== "email");
}

export type RedeemStatus =
  | "rewarded"
  | "invalid"
  | "self"
  | "already_claimed"
  | "unverified"
  | "error";

export async function redeemReferralCode(
  userId: string,
  rawCode: string,
): Promise<{ status: RedeemStatus; credits?: number }> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { status: "invalid" };

  if (!(await isEmailVerified(userId))) return { status: "unverified" };

  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("id")
    .eq("referred_user_id", userId)
    .maybeSingle();
  if (existing) return { status: "already_claimed" };

  const { data: ownerId } = await supabaseAdmin.rpc("referral_code_owner", { _code: code });
  if (!ownerId) return { status: "invalid" };
  if (ownerId === userId) return { status: "self" };

  const settings = await loadRewardSettings();

  const { error } = await supabaseAdmin.from("referrals").insert({
    referrer_id: ownerId,
    referred_user_id: userId,
    code,
    status: "rewarded",
    referrer_credits_awarded: settings.referrer_credits,
    invitee_credits_awarded: settings.invitee_credits,
    rewarded_at: new Date().toISOString(),
  });
  // Unique constraint => a parallel call already claimed it.
  if (error) return { status: "already_claimed" };

  await supabaseAdmin.from("profiles").update({ referred_by: ownerId }).eq("id", userId);
  await grantCredits(userId, settings.invitee_credits, "welcome_bonus", "Welcome bonus for joining via a referral", {
    code,
  });
  await grantCredits(ownerId, settings.referrer_credits, "referral_bonus", "Referral bonus — invited member verified", {
    code,
    referred_user_id: userId,
  });

  return { status: "rewarded", credits: settings.invitee_credits };
}

/**
 * Records a paid subscription. Payment provider integration point: call this
 * from a verified Stripe / Paystack webhook once a charge succeeds.
 * Commission is paid on the referred member's FIRST successful payment only.
 */
export async function recordSubscription(input: {
  userId: string;
  plan: string;
  interval: string;
  amountCents: number;
  currency?: string;
  provider?: string | null;
  providerReference?: string | null;
}) {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (input.interval === "yearly" ? 12 : 1));

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: input.userId,
      plan: input.plan,
      billing_interval: input.interval,
      status: "active",
      provider: input.provider ?? null,
      provider_reference: input.providerReference ?? null,
      amount_cents: input.amountCents,
      currency: input.currency ?? "USD",
      current_period_end: periodEnd.toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (input.amountCents <= 0) return { commissionCents: 0 };

  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id, commission_paid_at")
    .eq("referred_user_id", input.userId)
    .maybeSingle();

  if (!referral || referral.commission_paid_at) return { commissionCents: 0 };

  const settings = await loadRewardSettings();
  const commissionCents = Math.round((input.amountCents * settings.commission_percent) / 100);

  await supabaseAdmin
    .from("referrals")
    .update({ commission_cents: commissionCents, commission_paid_at: new Date().toISOString() })
    .eq("id", referral.id);

  const { data: referrerProfile } = await supabaseAdmin
    .from("profiles")
    .select("commission_cents")
    .eq("id", referral.referrer_id)
    .maybeSingle();

  await supabaseAdmin
    .from("profiles")
    .update({ commission_cents: (referrerProfile?.commission_cents ?? 0) + commissionCents })
    .eq("id", referral.referrer_id);

  return { commissionCents };
}
