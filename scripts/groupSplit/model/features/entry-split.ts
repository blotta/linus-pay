import { Entry } from "../../../../src/features/group-split/groupSplit.types";
import { check, RunContext } from "../../../utils";
import { validateEntrySplits } from "../../../../src/features/group-split/groupSplit.validation";

export async function entrySplitValidation(ctx: RunContext) {
  // setup
  const entry: Entry = {
    id: "abcd",
    created_at: new Date(),
    amount: 100,
    description: "something",
    date: new Date(),
    group_id: "group1",
    member_id: "member1",
    installment: 1,
    installments: 1,
    obs: null,
    payment_type: "credit-card",
    splits: [],
  };

  ctx.step = "Validate Entry:NoSplits";
  {
    const { valid, error } = validateEntrySplits(entry);
    check(ctx, valid, error, { shouldError: true });
  }

  ctx.step = "Validate Entry:A20,R";
  {
    entry.splits = [
      {
        id: "split1",
        entry_id: "abcd",
        member_id: "member1",
        split_type: "amount",
        amount: 20,
        percentage: null,
      },
      {
        id: "split2",
        entry_id: "abcd",
        member_id: "member2",
        split_type: "remainder",
        amount: null,
        percentage: null,
      },
    ];

    const { valid, error } = validateEntrySplits(entry);
    check(ctx, valid, error);
  }

  ctx.step = "Validate Entry:A20,P10,R";
  {
    entry.splits = [
      {
        id: "split1",
        entry_id: "abcd",
        member_id: "member1",
        split_type: "amount",
        amount: 20,
        percentage: null,
      },
      {
        id: "split2",
        entry_id: "abcd",
        member_id: "member2",
        split_type: "percentage",
        amount: null,
        percentage: 10,
      },
      {
        id: "split3",
        entry_id: "abcd",
        member_id: "member3",
        split_type: "remainder",
        amount: null,
        percentage: null,
      },
    ];

    const { valid, error } = validateEntrySplits(entry);
    check(ctx, valid, error);
  }

  ctx.step = "Validate Entry:A20,P10";
  {
    entry.splits = [
      {
        id: "split1",
        entry_id: "abcd",
        member_id: "member1",
        split_type: "amount",
        amount: 20,
        percentage: null,
      },
      {
        id: "split2",
        entry_id: "abcd",
        member_id: "member2",
        split_type: "percentage",
        amount: null,
        percentage: 10,
      },
    ];

    const { valid: validation, error } = validateEntrySplits(entry);
    check(ctx, validation, error, { shouldError: true });
  }

  ctx.step = "Validate Entry:P20,P80";
  {
    entry.splits = [
      {
        id: "split1",
        entry_id: "abcd",
        member_id: "member1",
        split_type: "percentage",
        amount: null,
        percentage: 20,
      },
      {
        id: "split2",
        entry_id: "abcd",
        member_id: "member2",
        split_type: "percentage",
        amount: null,
        percentage: 80,
      },
    ];

    const { valid: validation, error } = validateEntrySplits(entry);
    check(ctx, validation, error, { shouldError: true });
  }
}
