import { supabase } from "@/integrations/supabase/client";

export const FILES_BUCKET = "user-files";

/**
 * Upload a file to the user's private storage prefix and record it in `files`.
 */
export async function uploadUserFile(opts: {
  userId: string;
  file: File;
  projectId?: string | null;
  missionId?: string | null;
  kind?: string;
}) {
  const { userId, file, projectId, missionId, kind = "document" } = opts;
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const up = await supabase.storage.from(FILES_BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) throw up.error;

  const row = {
    user_id: userId,
    project_id: projectId ?? null,
    mission_id: missionId ?? null,
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
    storage_path: path,
    kind,
  };
  const { data, error } = await supabase.from("files").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function getSignedUrl(storagePath: string, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage.from(FILES_BUCKET).createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteUserFile(id: string, storagePath: string) {
  await supabase.storage.from(FILES_BUCKET).remove([storagePath]);
  await supabase.from("files").delete().eq("id", id);
}
