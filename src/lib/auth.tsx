import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

import type { Session, User as SbUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

function toUser(sb: SbUser | null | undefined): User | null {
  if (!sb) return null;
  const meta = (sb.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.name as string) ||
    (meta.full_name as string) ||
    (sb.email ? sb.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "You");
  return {
    id: sb.id,
    email: sb.email ?? "",
    name,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Register listener first, then hydrate
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(toUser(s?.user));
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
      if (error) throw error;
    },
    async register(name, email, password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
 {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
},
      
    },,async loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
}
      });
      if (result.error) throw result.error;
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    async logout() {
      await supabase.auth.signOut();
    },
    async updateUser(patch) {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...(patch.name ? { name: patch.name } : {}),
          ...(patch.avatarUrl ? { avatar_url: patch.avatarUrl } : {}),
        },
      });
      if (error) throw error;
      // Optimistic local update
      setUser((u) => (u ? { ...u, ...patch } : u));
      // Persist to profiles row too
      if (user) {
        await supabase.from("profiles").update({
          ...(patch.name ? { name: patch.name } : {}),
          ...(patch.avatarUrl ? { avatar_url: patch.avatarUrl } : {}),
        }).eq("id", user.id);
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
