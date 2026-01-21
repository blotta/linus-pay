import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entry, Group, GroupMember } from "./groupSplit.types";
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
  entries: _DbEntry[];
};

type _DbGroupMember = {
  id: string;
  user_id: string | null;
  name: string;
  group_id: string;
  created_at: string;
};

type _DbEntry = {
  id: string;
  created_at: string;
  group_id: string;
  member_id: string;
  description: string;
  date: string;
  amount: number;
  installment: number;
  installments: number;
  obs: string | null;
  payment_type: "credit-card" | "debit-card" | "pix" | "boleto" | "cash";
};

function dbToObjGroup(data: _DbGroup): Group {
  const members: GroupMember[] = data.members
    .map((m) => dbToObjGroupMember(m))
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

function dbToObjGroupMember(data: _DbGroupMember): GroupMember {
  const member: GroupMember = {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    group_id: data.group_id,
    created_at: new Date(data.created_at),
  };
  return member;
}

function dbToObjEntry(data: _DbEntry): Entry {
  const entry: Entry = {
    id: data.id,
    created_at: new Date(data.created_at),
    group_id: data.group_id,
    member_id: data.member_id,
    description: data.description,
    date: new Date(data.date),
    amount: data.amount,
    installment: data.installment,
    installments: data.installments,
    obs: data.obs,
    payment_type: data.payment_type,
  };
  return entry;
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

  const group: Group = dbToObjGroup(data);

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

  return { data: dbToObjGroup(data), error: null };
}

type Mem = {
  user_id: string | null;
  name: string;
};
export async function upsertGroupUserMembers(
  supabase: SupabaseClient,
  group_id: string,
  members: Mem[],
): Promise<ApiResult<GroupMember[]>> {
  const userMems: Mem[] = members.filter((m) => m.user_id != null);
  const virtMems: Mem[] = members.filter((m) => m.user_id == null);

  const { data: group } = await getGroup(supabase, group_id);
  const prevUserMembers: GroupMember[] = group!.members.filter(
    (m) => m.user_id != null,
  );
  const prevVirtMembers: GroupMember[] = group!.members.filter(
    (m) => m.user_id == null,
  );

  const removeUserMemberIds: string[] = prevUserMembers
    .filter((mb) => userMems.find((m) => m.user_id == mb.user_id) == null)
    .map((m) => m.id);
  const removeVirtMemberIds: string[] = prevVirtMembers
    .filter((mb) => virtMems.find((m) => m.name == mb.name) == null)
    .map((m) => m.id);
  const removeMemberIds = [...removeUserMemberIds, ...removeVirtMemberIds];

  if (removeMemberIds.length > 0) {
    const { error } = await supabase
      .from("gs_group_members")
      .delete()
      .eq("group_id", group_id)
      .in("id", removeMemberIds);
    if (error) {
      return { data: null, error: error.message };
    }
  }

  const addUserMems: Mem[] = userMems.filter(
    (m) => prevUserMembers.find((mb) => mb.user_id == m.user_id) == null,
  );
  const addVirtMems: Mem[] = virtMems.filter(
    (m) => prevVirtMembers.find((mb) => mb.name == m.name) == null,
  );
  const addMems: Mem[] = [...addUserMems, ...addVirtMems];

  if (addMems.length > 0) {
    const toAdd = addMems.map((m) => ({
      user_id: m.user_id,
      group_id: group_id,
      name: m.name,
    }));
    const { error } = await supabase.from("gs_group_members").insert(toAdd);

    if (error) {
      return { data: null, error: error.message };
    }
  }

  const { data: updatedGroup } = await getGroup(supabase, group_id);

  return { data: updatedGroup!.members, error: null };
}

export async function getEntries(
  supabase: SupabaseClient,
  group_id: string,
): Promise<ApiResult<Entry[]>> {
  const { data, error } = await supabase
    .from("gs_entries")
    .select(
      `
      id,
      created_at,
      group_id,
      member_id,
      description,
      date,
      amount,
      installment,
      installments,
      obs,
      payment_type
      `,
    )
    .eq("group_id", group_id)
    .overrideTypes<_DbEntry[]>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.map((e) => dbToObjEntry(e)), error: null };
}

type EntryWithoutId = Omit<Entry, "id" | "created_at">;

export async function addEntry(
  supabase: SupabaseClient,
  entry: EntryWithoutId,
): Promise<ApiResult<string>> {
  const { data, error } = await supabase
    .from("gs_entries")
    .insert(entry)
    .select("id")
    .single()
    .overrideTypes<string>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.id, error: null };
}
