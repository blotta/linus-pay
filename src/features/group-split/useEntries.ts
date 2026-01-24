import { useEffect, useState } from "react";
import type { Entry, EntrySplit, GroupMember } from "./groupSplit.types";
import {
  getEntries,
  addEntry,
  updateEntry,
  getEntry,
  type EntryWithoutId,
  deleteEntry,
} from "./groupSplit.api";
import { supabase } from "@/helper/supabaseClient";
import { formatDate } from "@/utils/date";
import { create } from "zustand";

interface EntriesStore {
  entries: Entry[];
  fetching: boolean;
  updating: boolean;
  error: string | null;
  currentGroupId: string | undefined;
  fetchEntries: (groupId: string) => Promise<void>;
  addEntry: (entry: EntryWithoutId) => Promise<string | null>;
  updateEntry: (entry: Entry) => Promise<void>;
  removeEntry: (entryId: string) => Promise<void>;
}

export const useEntriesStore = create<EntriesStore>((set) => ({
  entries: [],
  fetching: false,
  updating: false,
  error: null,
  currentGroupId: undefined,
  fetchEntries: async (groupId: string) => {
    set((s) => ({
      ...s,
      fetching: true,
      entries: groupId === s.currentGroupId ? [...s.entries] : [],
      currentGroupId: groupId,
    }));
    const { data, error } = await getEntries(supabase, groupId);
    if (error) {
      set((s) => ({ ...s, entries: [], fetching: false, error: error }));
      return;
    }
    set((s) => ({ ...s, entries: data!, fetching: false, error: null }));
  },

  addEntry: async (entry: EntryWithoutId): Promise<string | null> => {
    set((s) => ({ ...s, updating: true }));

    const { data: newEntryId, error } = await addEntry(supabase, entry);
    if (error) {
      set((s) => ({ ...s, entries: [], updating: false, error: error }));
      return null;
    }
    const { data: newEntry } = await getEntry(supabase, newEntryId!);

    set((s) => ({
      ...s,
      entries: [...s.entries, newEntry!],
      updating: false,
      error: null,
    }));
    return newEntryId!;
  },

  updateEntry: async (entry: Omit<Entry, "splits">) => {
    set((s) => ({ ...s, updating: true }));

    const { error } = await updateEntry(supabase, entry);
    if (error) {
      set({ updating: false, error: error });
      return;
    }

    set((s) => ({
      ...s,
      entries: s.entries.map((e) => {
        if (e.id === entry.id) {
          return { ...e, ...entry };
        }
        return e;
      }),
      updating: false,
      error: null,
    }));
  },

  removeEntry: async (entryId: string) => {
    set((s) => ({ ...s, updating: true }));

    const { error } = await deleteEntry(supabase, entryId);
    if (error) {
      set({ updating: false, error: error });
      return;
    }

    set((s) => ({
      ...s,
      entries: s.entries.filter((e) => e.id !== entryId),
      updating: false,
      error: null,
    }));
  },
}));

export const useEntries = (groupId: string) => {
  const fetch = useEntriesStore((s) => s.fetchEntries);
  const entries = useEntriesStore((s) => s.entries);
  const currentGroupId = useEntriesStore((s) => s.currentGroupId);
  const fetching = useEntriesStore((s) => s.fetching);
  const updating = useEntriesStore((s) => s.updating);
  const error = useEntriesStore((s) => s.error);

  useEffect(() => {
    fetch(groupId);
  }, [groupId, fetch]);

  return {
    entries,
    fetching,
    updating,
    error,
    currentGroupId,
  };
};

type EntryFormValues = Omit<Entry, "id" | "created_at" | "date" | "splits"> & {
  id: string | null | undefined;
  created_at: string | null | undefined;
  date: string;
  splits: EntrySplitFormValues[];
};

type EntrySplitFormValues = Omit<EntrySplit, "id" | "entry_id"> & {
  id: string | null | undefined;
  entry_id: string | null | undefined;
};

export type UseEntryFormParams = {
  initialEntry?: Entry;
  groupId: string;
  creatorMemberId: string;
  members: GroupMember[];
  onSuccess?: (entryId: string) => void;
};
export function useEntryForm({
  initialEntry,
  groupId,
  creatorMemberId,
  members,
  onSuccess,
}: UseEntryFormParams) {
  const [values, setValues] = useState<EntryFormValues>(() => ({
    id: initialEntry?.id,
    description: initialEntry?.description ?? "",
    amount: initialEntry?.amount ?? 0,
    installment: initialEntry?.installment ?? 1,
    installments: initialEntry?.installments ?? 1,
    member_id: initialEntry?.member_id ?? creatorMemberId,
    date: formatDate(initialEntry?.date ?? new Date(), "yyyy-MM-dd"),
    created_at: initialEntry?.created_at.toISOString() ?? null,
    group_id: initialEntry?.group_id ?? groupId,
    obs: initialEntry?.obs ?? null,
    payment_type: initialEntry?.payment_type ?? "credit-card",
    splits:
      initialEntry?.splits ??
      members.map((m, i) => ({
        id: null,
        split_type: members.length == i + 1 ? "remainder" : "percentage",
        percentage: members.length == i + 1 ? null : 100 / members.length,
        amount: null,
        entry_id: initialEntry?.id,
        member_id: m.id,
      })),
  }));
  const isEdit = Boolean(initialEntry?.id);
  const { addEntry, updateEntry, removeEntry, error } = useEntriesStore();

  const submit = async () => {
    // setLoading(true);
    if (isEdit) {
      // update
      const entry: Entry = {
        id: values.id!,
        description: values.description,
        amount: values.amount,
        installment: values.installment,
        installments: values.installments,
        member_id: values.member_id,
        group_id: values.group_id,
        date: new Date(values.date),
        created_at: new Date(values.created_at!),
        payment_type: values.payment_type,
        obs: values.obs,
        // TODO: fix
        splits: [],
        // splits: values.splits,
      };
      await updateEntry(entry);
      if (!error) {
        onSuccess?.(entry.id);
      }
    } else {
      // new
      const entry: EntryWithoutId = {
        date: new Date(values.date),
        amount: values.amount,
        description: values.description,
        group_id: values.group_id,
        installment: values.installment,
        installments: values.installments,
        member_id: values.member_id,
        obs: values.obs,
        payment_type: values.payment_type,
        splits: values.splits,
      };
      const entryId = await addEntry(entry);
      if (!error) {
        onSuccess?.(entryId!);
      }
    }
  };

  return { values, setValues, submit, isEdit, removeEntry };
}
