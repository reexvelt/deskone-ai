import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchOnboarding, isOnboardedLocally, markOnboardedLocally } from "@/lib/onboarding";
import { clearPendingReferral, readPendingReferral } from "@/lib/referrals";
import { redeemReferral } from "@/lib/referrals.functions";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in · AnchorSpace" },
      { name: "description", content: "Completing your AnchorSpace sign-in and opening your workspace." },
      { property: "og:title", content: "Signing you in · AnchorSpace" },
      { property: "og:description", content: "Completing your AnchorSpace sign-in and opening your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthCallback,
});

/** Reads params from both the query string and the URL fragment. */
function readCallbackParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  hash.forEach((value, key) => {
    if (!query.has(key)) query.set(key, value);
  });
  return query;
}

/** Turns Supabase's callback error codes into copy a human can act on. */
function describeError(params: URLSearchParams): string | null {
  const code = params.get("error_code");
  const error = params.get("error");
  if (!code && !error) return null;
  if (code === "otp_expired" || code === "email_link_invalid")
    return "That confirmation link has expired. Links are valid for a limited time — request a fresh one below.";
  if (error === "access_denied") return "That link has already been used or is no longer valid. Request a new one below.";
  return params.get("error_description")?.replace(/\+/g, " ") ?? "We couldn't complete sign-in with that link.";
}

function AuthCallback() {
  const { user, ready, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);
  const verifying = useRef(false);

  // Step 1 — if the link came as a token_hash (Supabase's server-side confirm
  // format), exchange it for a session explicitly.
  useEffect(() => {
    if (verifying.current) return;
    verifying.current = true;

    const params = readCallbackParams();
    const described = describeError(params);
    if (described) {
      setFailure(described);
      return;
    }

    const tokenHash = params.get("token_hash");
    const type = params.get("type") as EmailOtpType | null;
    if (!tokenHash || !type) return;

    void supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
      if (error) setFailure("That confirmation link is no longer valid. Request a fresh one below.");
    });
  }, []);

  // Step 2 — once a session exists, redeem any pending invite and route the
  // user into onboarding or the workspace.
  useEffect(() => {
    if (!ready || failure) return;
    if (!user) {
      // The Supabase client may still be exchanging the code/fragment.
      const t = setTimeout(
        () => setFailure("We couldn't finish sign-in. The link may have expired or already been used."),
        8000,
      );
      return () => clearTimeout(t);
    }

    let active = true;
    const go = async () => {
      const pending = readPendingReferral();
      if (pending) {
        try {
          const result = await redeemReferral({ data: { code: pending } });
          if (result.status === "rewarded") {
            clearPendingReferral();
            toast.success(`Invite applied — ${result.credits} welcome credits added.`);
          } else if (result.status !== "unverified") {
            clearPendingReferral();
          }
        } catch {
          /* referral can be retried on the next sign-in */
        }
      }
      if (!active) return;

      if (isOnboardedLocally(user.id)) {
        toast.success("You're in. Welcome to AnchorSpace.");
        navigate({ to: "/home", replace: true });
        return;
      }
      const answers = await fetchOnboarding(user.id);
      if (!active) return;
      if (answers?.completed) {
        markOnboardedLocally(user.id);
        navigate({ to: "/home", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    };
    void go();
    return () => {
      active = false;
    };
  }, [ready, user, navigate, failure]);

  if (failure) return <CallbackFailure message={failure} onResend={resendVerification} />;

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Opening your workspace…</p>
      </div>
    </main>
  );
}

function CallbackFailure({
  message,
  onResend,
}: {
  message: string;
  onResend: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter the email you signed up with");
      return;
    }
    setSending(true);
    try {
      await onResend(email);
      setSent(true);
      toast.success("New link sent — check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send a new link");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthShell
      title="This link has expired"
      subtitle="No problem — we'll send you a fresh one."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-warning/12 text-warning">
          <ShieldAlert className="h-5 w-5" aria-hidden />
        </span>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">{message}</p>

        {sent ? (
          <p className="mt-5 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm leading-6 text-success">
            Sent. Open the newest email from AnchorSpace and click the link — older links stop working.
          </p>
        ) : (
          <form onSubmit={resend} className="mt-5 space-y-3">
            <Label htmlFor="resend-email" className="text-xs text-muted-foreground">
              Your email
            </Label>
            <Input
              id="resend-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-2xl"
            />
            <Button type="submit" disabled={sending} className="h-12 w-full rounded-full text-sm font-semibold">
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Send a new link
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
