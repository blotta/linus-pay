import type { SupabaseClient } from "@supabase/supabase-js";
import type { Group } from "./groupSplit.types";

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type UserGroup = {
  id: string;
  name: string;
  created_at: Date;
  members: { id: string; user_id: string | null; name: string }[];
};

type _GetUserGroupsQueryRet = {
  group: UserGroup;
};

export async function getUserGroups(
  supabase: SupabaseClient,
  uid: string,
): Promise<ApiResult<UserGroup[]>> {
  const { data, error } = await supabase
    .from("gs_group_members")
    .select(
      `
      group: gs_groups (
        id,
        name,
        created_at,
        members: gs_group_members (
          id,
          user_id,
          name
        )
      )
      `,
    )
    .eq("user_id", uid)
    .overrideTypes<_GetUserGroupsQueryRet[]>();

  if (error) {
    return { data: null, error: error.message };
  }

  const groups: UserGroup[] = data?.map((r) => r.group) ?? [];
  return { data: groups, error: null };
}

type _GetGroupQueryRet = {
  id: string;
  name: string;
  members: {
    id: string;
    user_id: string | null;
    name: string;
  }[];
};

export async function getGroup(
  supabase: SupabaseClient,
  groupId: string,
): Promise<ApiResult<Group>> {
  const { data, error } = await supabase
    .from("gs_groups")
    .select(
      `
      id,
      name,
      members: gs_group_members (
        id,
        user_id,
        name
      )
      `,
    )
    .eq("id", groupId)
    .single()
    .overrideTypes<_GetGroupQueryRet>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
