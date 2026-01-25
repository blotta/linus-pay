import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entry, EntrySplit, Group, GroupMember } from "./groupSplit.types";
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

export const PAYMENT_TYPES = [
  "credit-card",
  "debit-card",
  "pix",
  "boleto",
  "cash",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export function labelForPaymentType(type: PaymentType): string {
  switch (type) {
    case "credit-card":
      return "Credit Card";
    case "debit-card":
      return "Debit Card";
    case "pix":
      return "Pix";
    case "boleto":
      return "Boleto";
    case "cash":
      return "Cash";
  }
}

export const SPLIT_TYPES = ["percentage", "amount", "remainder"] as const;

export type SplitType = (typeof SPLIT_TYPES)[number];

export function labelForSplitType(type: SplitType): string {
  switch (type) {
    case "percentage":
      return "Percentage";
    case "amount":
      return "Amount";
    case "remainder":
      return "Remainder";
  }
}

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
  payment_type: PaymentType;
  splits: _DbEntrySplit[];
};

type _DbEntrySplit = {
  id: string;
  entry_id: string;
  member_id: string;
  split_type: SplitType;
  amount: number | null;
  percentage: number | null;
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
    splits: data.splits.map((s) => dbToObjEntrySplit(s)),
  };
  return entry;
}

function dbToObjEntrySplit(data: _DbEntrySplit): EntrySplit {
  const split: EntrySplit = {
    id: data.id,
    entry_id: data.entry_id,
    member_id: data.member_id,
    split_type: data.split_type,
    amount: data.amount,
    percentage: data.percentage,
  };
  return split;
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

export async function getEntry(
  supabase: SupabaseClient,
  entryId: string,
): Promise<ApiResult<Entry>> {
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
      payment_type,
      splits: gs_entry_splits (
        id,
        entry_id,
        member_id,
        split_type,
        amount,
        percentage
      )
      `,
    )
    .eq("id", entryId)
    .single()
    .overrideTypes<_DbEntry>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: dbToObjEntry(data!), error: null };
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
      payment_type,
      splits: gs_entry_splits (
        id,
        entry_id,
        member_id,
        split_type,
        amount,
        percentage
      )
      `,
    )
    .eq("group_id", group_id)
    .overrideTypes<_DbEntry[]>();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data.map((e) => dbToObjEntry(e)), error: null };
}

export type EntryWithoutId = Omit<Entry, "id" | "created_at" | "splits"> & {
  splits: EntrySplitWithoutId[];
};
export type EntrySplitWithoutId = Omit<EntrySplit, "id" | "entry_id">;

export async function addEntry(
  supabase: SupabaseClient,
  entry: EntryWithoutId,
): Promise<ApiResult<string>> {
  const { data, error } = await supabase
    .from("gs_entries")
    .insert({
      group_id: entry.group_id,
      member_id: entry.member_id,
      description: entry.description,
      date: entry.date,
      amount: entry.amount,
      installment: entry.installment,
      installments: entry.installments,
      obs: entry.obs,
      payment_type: entry.payment_type,
    })
    .select("id")
    .single()
    .overrideTypes<string>();

  if (error) {
    return { data: null, error: error.message };
  }

  const entryId = data.id;

  const { error: errorSplit } = await supabase
    .from("gs_entry_splits")
    .insert(entry.splits.map((s) => ({ ...s, entry_id: entryId })))
    .select("id, member_id")
    .overrideTypes<{ id: string; member_id: string }[]>();

  if (errorSplit) {
    return { data: null, error: errorSplit.message };
  }

  return { data: entryId, error: null };
}

export async function updateEntry(
  supabase: SupabaseClient,
  entry: Omit<Entry, "splits">,
): Promise<ApiResult<boolean>> {
  const { error } = await supabase
    .from("gs_entries")
    .update(entry)
    .eq("id", entry.id);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: true, error: null };
}

export async function deleteEntry(
  supabase: SupabaseClient,
  entryId: string,
): Promise<ApiResult<boolean>> {
  const { error } = await supabase
    .from("gs_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: true, error: null };
}

type EntrySplitUpsert = Omit<EntrySplit, "id"> & {
  id: string | null;
};

// TODO: maybe delete everything and recreate?
export async function upsertEntrySplits(
  supabase: SupabaseClient,
  entryId: string,
  splits: EntrySplitUpsert[],
): Promise<ApiResult<EntrySplit[]>> {
  const { data: entry } = await getEntry(supabase, entryId);
  const prevSplits = entry!.splits;

  const toUpdate = splits.filter(
    (s) => prevSplits.find((p) => p.id == s.id) != undefined,
  );
  const toAdd = splits.filter((s) => s.id == null);
  const toDelete = prevSplits.filter(
    (p) => splits.find((s) => s.id == p.id) == undefined,
  );

  // delete
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("gs_entry_splits")
      .delete()
      .in(
        "id",
        toDelete.map((s) => s.id),
      );
    if (deleteError) {
      return { data: null, error: deleteError.message };
    }
  }

  const ret: EntrySplit[] = [];

  // update
  if (toUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from("gs_entry_splits")
      .upsert(toUpdate);
    if (updateError) {
      return { data: null, error: updateError.message };
    }
    ret.push(...(toUpdate as EntrySplit[]));
  }

  // add
  if (toAdd.length > 0) {
    const { data: insertData, error: insertError } = await supabase
      .from("gs_entry_splits")
      .insert(
        toAdd.map((s) => ({
          entry_id: s.entry_id,
          member_id: s.member_id,
          split_type: s.split_type,
          amount: s.amount,
          percentage: s.percentage,
        })),
      )
      .select(
        `
      id,
      entry_id,
      member_id,
      split_type,
      amount,
      percentage
      `,
      )
      .overrideTypes<_DbEntrySplit[]>();
    if (insertError) {
      return { data: null, error: insertError.message };
    }
    ret.push(...insertData.map((s) => dbToObjEntrySplit(s)));
  }

  return { data: ret, error: null };
}
