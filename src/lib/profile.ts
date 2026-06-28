import { supabase } from "./supabase";
import type { Session } from "./session";

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string | null;
  company: string;
  job_title: string;
  phone: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as UserProfile | null;
}

export async function upsertProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<void> {
  const { error } = await supabase.from("user_profiles").upsert(profile, {
    onConflict: "user_id",
  });
  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
  });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export function getAvatarUrl(session: Session): string | null {
  return session.user.avatarUrl ?? null;
}
