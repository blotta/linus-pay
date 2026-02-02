import type { SplitType } from "./groupSplit.types";

export interface ComputeBalancesEntry {
  member_id: string;
  amount: number;
  splits: {
    member_id: string;
    amount: number | null;
    percentage: number | null;
    split_type: SplitType;
  }[];
}
export function computeSplitAmounts(
  entries: ComputeBalancesEntry[],
): Record<string, number> {
  const entriesSplitAmounts: Record<string, number> = {};

  for (const entry of entries) {
    const entrySplitAmounts: Record<string, number> = {};

    // remainder calculated last
    const sortedSplits = [...entry.splits].sort((a) =>
      a.split_type === "remainder" ? 1 : -1,
    );

    for (const split of sortedSplits) {
      // resolve split amount
      let payAmount = 0;
      if (split.split_type === "amount") {
        payAmount = split.amount!;
      }
      if (split.split_type === "percentage") {
        payAmount = entry.amount * split.percentage!;
      }
      if (split.split_type === "remainder") {
        payAmount =
          entry.amount -
          Object.values(entrySplitAmounts).reduce((sum, curr) => sum + curr, 0);
      }

      payAmount = payAmount < 0 ? 0 : payAmount;
      payAmount = Math.floor(payAmount * 100) / 100;

      entrySplitAmounts[split.member_id] = payAmount;
    }

    // apply to overall balance
    for (const [m, a] of Object.entries(entrySplitAmounts)) {
      entriesSplitAmounts[m] ??= 0;
      entriesSplitAmounts[m] += a;
    }
  }

  return entriesSplitAmounts;
}

export function checkComputedSplitAmounts(
  amount: number,
  r: Record<string, number>,
) {
  const sum = Object.values(r).reduce((sum, curr) => sum + curr, 0);
  const matchesSum = sum === amount;
  const sumTxt = Object.entries(r)
    .map((s) => s[0] + ": " + s[1])
    .join(" + ");
  if (matchesSum) {
    return { data: `${sumTxt} = ${amount}`, error: null };
  } else {
    return { error: `${sumTxt} != ${amount}`, data: null };
  }
}
