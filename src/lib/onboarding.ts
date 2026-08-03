import { supabase } from "@/integrations/supabase/client";

export interface OnboardingAnswers {
  completed: boolean;
  role?: string;
  useCases?: string[];
  tools?: string[];
  source?: string;
  challenge?: string;
  completedAt?: string;
}

type WorkspaceJson = Record<string, unknown> & { onboarding?: OnboardingAnswers };

/** Reads the signed-in user's onboarding state from their profile row. */
export async function fetchOnboarding(userId: string): Promise<OnboardingAnswers | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("workspace")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  const workspace = (data?.workspace ?? {}) as WorkspaceJson;
  return workspace.onboarding ?? null;
}

/** Merges onboarding answers into the profile's workspace json without clobbering it. */
export async function saveOnboarding(userId: string, answers: OnboardingAnswers): Promise<void> {
  const { data } = await supabase.from("profiles").select("workspace").eq("id", userId).maybeSingle();
  const workspace = { ...((data?.workspace ?? {}) as WorkspaceJson), onboarding: answers };
  const { error } = await supabase
    .from("profiles")
    .update({ workspace: workspace as never })
    .eq("id", userId);
  if (error) throw error;
}

const CACHE_PREFIX = "anchorspace.onboarded.";

export function markOnboardedLocally(userId: string) {
  try {
    localStorage.setItem(CACHE_PREFIX + userId, "1");
  } catch {
    /* storage unavailable */
  }
}

export function isOnboardedLocally(userId: string): boolean {
  try {
    return localStorage.getItem(CACHE_PREFIX + userId) === "1";
  } catch {
    return false;
  }
}
