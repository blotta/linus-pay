import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApiResult } from "./api.types";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export async function getProfile(
  supabase: SupabaseClient,
  id: string,
): Promise<ApiResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", id)
    .single()
    .overrideTypes<Profile>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateProfile(
  supabase: SupabaseClient,
  id: string,
  values: { full_name: string },
): Promise<ApiResult<boolean>> {
  const { error } = await supabase.from("profiles").update(values).eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: true, error: null };
}

export async function searchProfiles(
  supabase: SupabaseClient,
  search: string,
  exclude: string[] = [],
): Promise<ApiResult<Profile[]>> {
  const s = search
    .trim()
    .split(" ")
    .filter((x) => x != "")
    .join("%");

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url
      `,
    )
    .ilike("full_name", `%${s}%`)
    .notIn("id", exclude);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data, error: null };
}
