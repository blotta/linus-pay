import type { Entry } from "./groupSplit.types";

export type SplitValidationResult =
  | { valid: true; error: null }
  | { valid: false; error: string };

export function validateEntrySplits(entry: Entry): SplitValidationResult {
  const splits = entry.splits;

  if (splits.length == 0) {
    return { valid: false, error: "Entry must have at least one split" };
  }

  // unique members
  const memberIds = splits.map((s) => s.member_id);
  if (new Set(memberIds).size !== memberIds.length) {
    return { valid: false, error: "Duplicate member in splits" };
  }

  const remainderSplits = splits.filter((s) => s.split_type === "remainder");
  if (remainderSplits.length > 1) {
    return { valid: false, error: "Only one remainder allowed" };
  }

  const amountTotal = splits
    .filter((s) => s.split_type === "amount")
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);

  const percentageTotal = splits
    .filter((s) => s.split_type === "percentage")
    .reduce((sum, s) => sum + (s.percentage ?? 0), 0);

  if (amountTotal > entry.amount) {
    return { valid: false, error: "Amount exceeds entry total" };
  }

  if (percentageTotal > 100) {
    return { valid: false, error: "Percentages exceed 100%" };
  }

  if (!remainderSplits.length) {
    if (amountTotal !== entry.amount && percentageTotal !== 100) {
      return {
        valid: false,
        error: "Splits must fully cover entry amount",
      };
    }
  }

  return { valid: true, error: null };
}
