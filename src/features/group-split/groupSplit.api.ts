import type { SupabaseClient } from "@supabase/supabase-js";
import type { Group, GroupMember } from "./groupSplit.types";
import type { ApiResult } from "@/api/api.types";

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

type _DbGroup = {
  id: string;
  name: string;
  created_at: Date;
  admin_id: string;
  members: _DbGroupMember[];
};

type _DbGroupMember = {
  id: string;
  user_id: string | null;
  name: string;
  group_id: string;
  created_at: string;
};

function queryToObjGroup(data: _DbGroup): Group {
  const members: GroupMember[] = data.members
    .map((m) => queryToObjGroupMember(m))
    .sort((a) => (a.id === data.admin_id ? -1 : 1));

  const group: Group = {
    id: data.id,
    name: data.name,
    created_at: new Date(data.created_at),
    admin_id: data.admin_id,
    members: members,
  };
  return group;
}

function queryToObjGroupMember(data: _DbGroupMember): GroupMember {
  const member: GroupMember = {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    group_id: data.group_id,
    created_at: new Date(data.created_at),
  };
  return member;
}

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
      created_at,
      admin_id,
      members: gs_group_members (
        id,
        user_id,
        name,
        group_id,
        created_at
      )
      `,
    )
    .eq("id", groupId)
    .single()
    .overrideTypes<_DbGroup>();

  if (error) {
    return { data: null, error: error.message };
  }

  const group: Group = queryToObjGroup(data);

  return { data: group, error: null };
}

export async function createGroup(
  supabase: SupabaseClient,
  name: string,
): Promise<ApiResult<string>> {
  const { data, error } = await supabase
    .from("gs_groups")
    .insert({ name })
    .select("id")
    .single()
    .overrideTypes<string>();

  if (error) {
    return { data: null, error: error.message };
  }

  // need to wait for db trigger to run
  return { data: data.id, error: null };
}

export async function updateGroup(
  supabase: SupabaseClient,
  id: string,
  values: { name: string },
): Promise<ApiResult<boolean>> {
  const { error } = await supabase
    .from("gs_groups")
    .update(values)
    .eq("id", id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: true, error: null };
}

export async function deleteGroup(
  supabase: SupabaseClient,
  id: string,
): Promise<ApiResult<Group>> {
  const { data, error } = await supabase
    .from("gs_groups")
    .delete()
    .eq("id", id)
    .select(
      `
      id,
      name,
      created_at,
      admin_id,
      members: gs_group_members (
        id,
        user_id,
        name,
        group_id,
        created_at
      )
      `,
    )
    .single()
    .overrideTypes<_DbGroup>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: queryToObjGroup(data), error: null };
}

export async function upsertGroupUserMembers(
  supabase: SupabaseClient,
  group_id: string,
  members: { user_id: string; name: string }[],
): Promise<ApiResult<GroupMember[]>> {
  const memberIds = members.map((m) => m.user_id!);

  const { data: group } = await getGroup(supabase, group_id);
  const prevMembers = group!.members;
  const prevMemberIds = prevMembers.map((m) => m.user_id);

  const removeIds = prevMemberIds.filter((m) => !memberIds.includes(m!));
  const addIds = memberIds.filter((m) => !prevMemberIds.includes(m));

  if (removeIds.length > 0) {
    const { error } = await supabase
      .from("gs_group_members")
      .delete()
      .eq("group_id", group_id)
      .in("user_id", removeIds);
    if (error) {
      return { data: null, error: error.message };
    }
  }

  if (addIds.length > 0) {
    const addMembers = members
      .filter((m) => addIds.includes(m.user_id!))
      .map((m) => ({
        user_id: m.user_id,
        group_id: group_id,
        name: m.name,
      }));
    const { error } = await supabase
      .from("gs_group_members")
      .insert(addMembers);

    if (error) {
      return { data: null, error: error.message };
    }
  }

  const { data: updatedGroup } = await getGroup(supabase, group_id);

  return { data: updatedGroup!.members, error: null };
}
