import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

import type { Session, User as SbUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface RegisterResult {
  needsVerification: boolean;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<RegisterResult>;
  resendVerification: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Omit<User, "emailVerified">>) => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

function toUser(sb: SbUser | null | undefined): User | null {
  if (!sb) return null;
  const meta = (sb.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    (sb.email ? sb.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "You");
  const isOAuth = (sb.identities ?? []).some((i) => i.provider !== "email");
  return {
    id: sb.id,
    email: sb.email ?? "",
    name,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
    emailVerified: Boolean(sb.email_confirmed_at) || isOAuth,
  };
}

/** Friendlier copy for the Supabase auth errors users actually hit. */
function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account already exists with this email. Try signing in instead.";
  if (m.includes("pwned") || m.includes("weak password"))
    return "That password has appeared in a data breach. Please choose a stronger one.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a minute and try again.";
  if (m.includes("unsupported provider")) return "Google sign-in isn't enabled yet. Please use email for now.";
  return message;
}

function fail(message: string): never {
  throw new Error(humanizeAuthError(message));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Register listener first, then hydrate the persisted session.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(toUser(s?.user));
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(toUser(data.session?.user));
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    user,
    session,
    ready,
    async login(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) fail(error.message);
    },
    async register(name, email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) fail(error.message);
      // Supabase returns an empty identities array when the email already exists.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        fail("An account already exists with this email.");
      }
      // A session means email confirmation is disabled — the user is already in.
      return { needsVerification: !data.session };
    },
    async resendVerification(email) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) fail(error.message);
    },
    async loginWithGoogle() {
      // Managed Google OAuth via the Lovable broker — works in preview,
      // published sites and custom domains.
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) fail(result.error.message);
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) fail(error.message);
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) fail(error.message);
    },
    async logout() {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    },
    async updateUser(patch) {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...(patch.name ? { name: patch.name } : {}),
          ...(patch.avatarUrl ? { avatar_url: patch.avatarUrl } : {}),
        },
      });
      if (error) fail(error.message);
      setUser((u) => (u ? { ...u, ...patch } : u));
      if (user) {
        await supabase
          .from("profiles")
          .update({
            ...(patch.name ? { name: patch.name } : {}),
            ...(patch.avatarUrl ? { avatar_url: patch.avatarUrl } : {}),
          })
          .eq("id", user.id);
      }
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
