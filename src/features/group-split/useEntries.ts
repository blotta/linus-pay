import { useEffect, useState } from "react";
import type { Entry } from "./groupSplit.types";
import { getEntries, addEntry, updateEntry, getEntry } from "./groupSplit.api";
import { supabase } from "@/helper/supabaseClient";
import { formatDate } from "@/utils/date";

export function useEntries(groupId: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshEntries, setRefreshEntries] = useState(0);
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
  }, [groupId, refreshEntries]);

  const refreshEntriesFn = () => {
    setRefreshEntries((s) => s + 1);
  };

  return {
    entries,
    setEntries,
    loading,
    error,
    refreshEntries: refreshEntriesFn,
  };
}

type EntryFormValues = Omit<Entry, "id" | "created_at" | "date"> & {
  id: string | null | undefined;
  created_at: string | null | undefined;
  date: string;
};

export type UseEntryFormParams = {
  initialEntry?: Entry;
  groupId: string;
  creatorMemberId: string;
  onSuccess?: (entry: Entry) => void;
};
export function useEntryForm({
  initialEntry,
  groupId,
  creatorMemberId,
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
  }));
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialEntry?.id);

  const submit = async () => {
    setLoading(true);
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
      };
      const { error } = await updateEntry(supabase, entry);
      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }
      onSuccess?.(entry);
    } else {
      // new
      const { data, error } = await addEntry(supabase, {
        date: new Date(values.date),
        amount: values.amount,
        description: values.description,
        group_id: values.group_id,
        installment: values.installment,
        installments: values.installments,
        member_id: values.member_id,
        obs: values.obs,
        payment_type: values.payment_type,
      });
      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }
      const { data: entry } = await getEntry(supabase, data!);
      onSuccess?.(entry!);
    }
    setLoading(false);
  };

  return { values, setValues, submit, loading, isEdit };
}
