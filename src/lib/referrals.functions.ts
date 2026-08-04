import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RedeemInput = z.object({ code: z.string().min(3).max(32) });

const CheckoutInput = z.object({
  plan: z.enum(["free", "plus", "pro", "business"]),
  interval: z.enum(["monthly", "yearly"]),
  amountCents: z.number().int().min(0).max(10_000_00),
  provider: z.enum(["stripe", "paystack"]).nullable().optional(),
});

/** Claims a referral code for the signed-in (verified) user and pays out credits. */
export const redeemReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RedeemInput.parse(input))
  .handler(async ({ data, context }) => {
    const { redeemReferralCode } = await import("./referrals.server");
    return redeemReferralCode(context.userId, data.code);
  });

/**
 * Activates a subscription for the signed-in user and pays first-payment
 * referral commission. Stripe / Paystack checkout sessions plug in here.
 */
export const activateSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CheckoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const { recordSubscription } = await import("./referrals.server");
    const result = await recordSubscription({
      userId: context.userId,
      plan: data.plan,
      interval: data.interval,
      amountCents: data.amountCents,
      provider: data.provider ?? null,
    });
    return { ok: true, ...result };
  });
