import { useEffect, useState } from "react";
import type { Entry } from "./groupSplit.types";
import { getEntries, addEntry } from "./groupSplit.api";
import { supabase } from "@/helper/supabaseClient";

export function useEntries(groupId: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!groupId) return;

    const loadEntries = async () => {
      setLoading(true);
      const { data, error } = await getEntries(supabase, groupId);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      setEntries(data!);
      setLoading(false);
    };
    loadEntries();
  }, [groupId]);

  const addEntryFn = async (
    entry: Omit<Entry, "id" | "created_at">,
  ): Promise<string | null> => {
    const { data, error } = await addEntry(supabase, entry);
    if (error) {
      setError(error);
      setLoading(false);
      return null;
    }
    return data;
  };

  return { entries, loading, error, addEntry: addEntryFn };
}
