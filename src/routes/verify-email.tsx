import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Loader2, MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Confirm Your Email · AnchorSpace" },
      { name: "description", content: "Confirm your email address to activate your AnchorSpace workspace." },
      { property: "og:title", content: "Confirm Your Email · AnchorSpace" },
      { property: "og:description", content: "Confirm your email address to activate your AnchorSpace workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const { user, ready, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (ready && user?.emailVerified) navigate({ to: "/auth/callback", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const target = email || user?.email || "";

  async function resend() {
    if (!target) return toast.error("We don't have an email address to send to.");
    setSending(true);
    try {
      await resendVerification(target);
      setCooldown(45);
      toast.success("Confirmation email sent again.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend the email");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthShell
      title="Confirm your email"
      subtitle="One last step before your workspace opens."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
          <MailCheck className="h-5 w-5" />
        </span>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          We sent a confirmation link{target ? " to " : ""}
          {target && <span className="font-medium text-foreground">{target}</span>}. Open it to activate your account —
          you'll land straight in workspace setup.
        </p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Nothing after a minute? Check spam and promotions folders, then resend below.
        </p>

        <Button
          type="button"
          variant="outline"
          disabled={sending || cooldown > 0}
          onClick={resend}
          className="mt-6 h-12 w-full rounded-full border-border bg-surface/60 text-sm font-medium"
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend confirmation email"}
        </Button>
      </div>
    </AuthShell>
  );
}
