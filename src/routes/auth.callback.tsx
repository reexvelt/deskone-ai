import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/lib/auth";
import { fetchOnboarding, isOnboardedLocally, markOnboardedLocally } from "@/lib/onboarding";
import { clearPendingReferral, readPendingReferral } from "@/lib/referrals";
import { redeemReferral } from "@/lib/referrals.functions";
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

function AuthCallback() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      // Give Supabase a moment to persist the session from the URL fragment.
      const t = setTimeout(() => setFailed(true), 4000);
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
  }, [ready, user, navigate]);

  if (failed) {
    return (
      <AuthShell
        title="We couldn't finish sign-in"
        subtitle="The link may have expired or already been used."
        footer={
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        }
      >
        <div className="rounded-3xl border border-border bg-surface/60 p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-warning/12 text-warning">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Try signing in again. If you were confirming your email, request a fresh link from the sign-in screen.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Opening your workspace…</p>
      </div>
    </main>
  );
}
