import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password · AnchorSpace" },
      { name: "description", content: "Choose a new password for your AnchorSpace account." },
      { property: "og:title", content: "Set a New Password · AnchorSpace" },
      { property: "og:description", content: "Choose a new password for your AnchorSpace account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  // Supabase delivers a recovery session via the URL hash; wait for it to land.
  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (active) setHasRecoverySession(Boolean(data.session));
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active && session) setHasRecoverySession(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated");
      navigate({ to: "/home", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose something strong you haven't used before."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      }
    >
      {hasRecoverySession === false ? (
        <div className="rounded-3xl border border-border bg-surface/60 p-6 text-sm leading-6 text-muted-foreground">
          This reset link is invalid or has expired.{" "}
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new one
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="h-12 rounded-2xl border-border bg-surface/60 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground transition hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Confirm password
            </Label>
            <Input
              id="confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="h-12 rounded-2xl border-border bg-surface/60 text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
