import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { fetchOnboarding, isOnboardedLocally, markOnboardedLocally } from "@/lib/onboarding";
import { GoogleButton } from "@/components/google-button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In · AnchorSpace" },
      { name: "description", content: "Sign in to your AnchorSpace workspace to manage projects, content and connected tools." },
      { property: "og:title", content: "Sign In · AnchorSpace" },
      { property: "og:description", content: "Sign in to your AnchorSpace workspace to manage projects, content and connected tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let active = true;
    const go = async () => {
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter your email and password");
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Redirect is handled by the effect above once the session lands.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up exactly where you left off."
      footer={
        <>
          New to AnchorSpace?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Email
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
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Password
            </Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
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

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-gradient-to-r from-secondary to-primary text-sm font-semibold"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <Divider />
        <GoogleButton onClick={loginWithGoogle} label="Continue with Google" />
      </form>
    </AuthShell>
  );
}

function Divider() {
  return (
    <div className="relative py-1.5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
      </div>
    </div>
  );
}
