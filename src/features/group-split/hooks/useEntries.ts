import { useEffect } from "react";
import type { Entry } from "../groupSplit.types";
import API, { type EntryWithoutId } from "../groupSplit.api";
import { supabase } from "@/helper/supabaseClient";
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
    const { data, error } = await API.getEntries(supabase, groupId);
    if (error) {
      set({ entries: [], fetching: false, error: error });
      return;
    }
    set({ entries: data!, fetching: false, error: null });
  },

  addEntry: async (entry: EntryWithoutId): Promise<string | null> => {
    set({ updating: true });

    const { data: newEntryId, error } = await API.addEntry(supabase, entry);
    if (error) {
      set({ updating: false, error: error });
      return null;
    }
    const { data: newEntry } = await API.getEntry(supabase, newEntryId!);

    set((s) => ({
      entries: [...s.entries, newEntry!],
      updating: false,
      error: null,
    }));
    return newEntryId!;
  },

  updateEntry: async (entry: Entry) => {
    set({ updating: true });

    const { error } = await API.updateEntry(supabase, entry);
    if (error) {
      set({ updating: false, error: error });
      return;
    }

    entry.splits.sort((a) => (a.split_type === "remainder" ? 1 : -1));

    set((s) => ({
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

    const { error } = await API.deleteEntry(supabase, entryId);
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
