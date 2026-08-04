import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { GoogleButton } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Check, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Your Account · AnchorSpace" },
      { name: "description", content: "Create your AnchorSpace workspace and connect the tools you already use in minutes." },
      { property: "og:title", content: "Create Your Account · AnchorSpace" },
      { property: "og:description", content: "Create your AnchorSpace workspace and connect the tools you already use in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function RegisterPage() {
  const { register, loginWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  // If a session exists (auto-confirm or OAuth), head straight into onboarding.
  useEffect(() => {
    if (ready && user) navigate({ to: "/onboarding", replace: true });
  }, [ready, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return toast.error("Fill in every field");
    if (password.length < 8) return toast.error("Use at least 8 characters");
    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password);
      if (result?.needsVerification) {
        navigate({ to: "/verify-email", search: { email: email.trim() }, replace: true });
        return;
      }
      setVerifyEmail(email.trim());

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (verifyEmail) {
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
            We sent a confirmation link to <span className="font-medium text-foreground">{verifyEmail}</span>. Open it
            to activate your account — you'll land straight in workspace setup.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Nothing yet? Check spam, or wait a minute and try signing in again.
          </p>
        </div>
      </AuthShell>
    );
  }

  const score = strength(password);

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Free forever plan. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Full name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            className="h-12 rounded-2xl border-border bg-surface/60 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="h-12 rounded-2xl border-border bg-surface/60 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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
          <div className="flex items-center gap-1.5 pt-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  password && i < score ? (score >= 3 ? "bg-success" : "bg-warning") : "bg-surface-2"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Creating your workspace…" : "Create account"}
        </Button>

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>
        </div>

        <GoogleButton onClick={loginWithGoogle} label="Sign up with Google" />

        <p className="flex items-start gap-2 pt-1 text-xs leading-5 text-muted-foreground">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
          By creating an account you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthShell>
  );
}
