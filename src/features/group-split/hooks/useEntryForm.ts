import { useMemo, useState } from "react";
import type {
  Entry,
  EntrySplit,
  GroupMember,
  SplitType,
} from "../groupSplit.types";
import { formatDate } from "date-fns";
import { useEntriesStore } from "./useEntries";
import type { EntryWithoutId } from "../groupSplit.api";
import { checkComputedSplitAmounts, computeSplitAmounts } from "../balance";

export type EntryFormValues = Omit<
  Entry,
  "id" | "created_at" | "date" | "splits"
> & {
  id: string | null | undefined;
  created_at: string | null | undefined;
  date: string;
  splits: EntrySplitFormValues[];
};

export type EntrySplitFormValues = Omit<EntrySplit, "entry_id"> & {
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
        // id: null,
        split_type: members.length == i + 1 ? "remainder" : "percentage",
        percentage:
          members.length == i + 1 ? null : Math.fround(1.0 / members.length),
        amount: null,
        entry_id: initialEntry?.id,
        member_id: m.id,
      })),
  }));
  const isEdit = Boolean(initialEntry?.id);
  const { addEntry, updateEntry, removeEntry, error } = useEntriesStore();

  const amounts = useMemo<Record<string, number>>(() => {
    const result = computeSplitAmounts([values]);
    return result;
  }, [values]);

  const amountsValid = useMemo<boolean>(() => {
    const result = checkComputedSplitAmounts(values.amount, amounts);
    return values.amount > 0 && !!result.data;
  }, [values, amounts]);

  const changeSplitType = (memberId: string, type: SplitType) => {
    const prevSplit = values.splits.find((s) => s.member_id == memberId)!;
    const newSplit: EntrySplitFormValues = {
      ...prevSplit,
      split_type: type,
      amount: prevSplit.amount ?? 0,
      percentage: prevSplit.percentage ?? 0,
    };
    setValues((v) => ({
      ...v,
      splits: v.splits.map((s) => {
        if (s.member_id == memberId) {
          return newSplit;
        }
        return s;
      }),
    }));
  };

  const changeSplitValue = (memberId: string, amountOrPercentage: number) => {
    const prevSplit = values.splits.find((s) => s.member_id == memberId)!;
    const newSplit: EntrySplitFormValues = {
      ...prevSplit,
      amount:
        prevSplit.split_type == "amount"
          ? amountOrPercentage
          : prevSplit.amount,
      percentage:
        prevSplit.split_type == "percentage"
          ? amountOrPercentage
          : prevSplit.percentage,
    };
    setValues((v) => ({
      ...v,
      splits: v.splits.map((s) => {
        if (s.member_id == memberId) {
          return newSplit;
        }
        return s;
      }),
    }));
  };

  const submit = async () => {
    if (amountsValid === false) {
      return;
    }
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

  return {
    values,
    setValues,
    amounts,
    amountsValid,
    submit,
    isEdit,
    removeEntry,
    changeSplitType,
    changeSplitValue,
  };
}
