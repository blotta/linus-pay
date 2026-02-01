import { computeSplitAmounts } from "../../../src/features/group-split/balance";
import { Entry } from "../../../src/features/group-split/groupSplit.types";
import { check, Val } from "../../utils";

const CheckSum = (r: Record<string, number>) => {
  const sum = Object.values(r).reduce((sum, curr) => sum + curr, 0);
  const matchesSum = sum === entry.amount;
  const sumTxt = Object.entries(r)
    .map((s) => s[0] + ": " + s[1])
    .join(" + ");
  if (matchesSum) {
    return { data: `${sumTxt} = ${entry.amount}`, error: null };
  } else {
    return { error: `${sumTxt} != ${entry.amount}`, data: null };
  }
};

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
  splits: [
    {
      entry_id: "abcd",
      member_id: "member1",
      split_type: "amount",
      amount: 20,
      percentage: null,
    },
    {
      entry_id: "abcd",
      member_id: "member2",
      split_type: "remainder",
      amount: null,
      percentage: null,
    },
  ],
};
const calc_100_A20R = computeSplitAmounts([entry]);
check("calc 100 A20 R", calc_100_A20R, [
  "sum ok",
  (d) => Val.isDefined(CheckSum(d).data),
]);

entry.splits = [
  {
    entry_id: "abcd",
    member_id: "member1",
    split_type: "percentage",
    amount: null,
    percentage: 0.2,
  },
  {
    entry_id: "abcd",
    member_id: "member2",
    split_type: "remainder",
    amount: null,
    percentage: null,
  },
];
const calc_100_P20R = computeSplitAmounts([entry]);
check("calc 100 P20 R", calc_100_P20R, [
  "sum ok",
  (d) => Val.isDefined(CheckSum(d).data),
]);

entry.splits = [
  {
    entry_id: "abcd",
    member_id: "member1",
    split_type: "amount",
    amount: 12.5,
    percentage: null,
  },
  {
    entry_id: "abcd",
    member_id: "member2",
    split_type: "percentage",
    amount: null,
    percentage: 0.2,
  },
  {
    entry_id: "abcd",
    member_id: "member3",
    split_type: "remainder",
    amount: null,
    percentage: null,
  },
];
const calc_100_A12p5P20R = computeSplitAmounts([entry]);
check("calc 100 A12.5 P20 R", calc_100_A12p5P20R, [
  "sum ok",
  (d) => Val.isDefined(CheckSum(d).data),
]);

entry.amount = 113;
entry.splits = [
  {
    entry_id: "abcd",
    member_id: "member1",
    split_type: "amount",
    amount: 12.5,
    percentage: null,
  },
  {
    entry_id: "abcd",
    member_id: "member2",
    split_type: "percentage",
    amount: null,
    percentage: 0.21,
  },
  {
    entry_id: "abcd",
    member_id: "member3",
    split_type: "remainder",
    amount: null,
    percentage: null,
  },
];
const calc_113_A12p5P21R = computeSplitAmounts([entry]);
check("calc 113 A12.5 P20 R", calc_113_A12p5P21R, [
  "sum ok",
  (d) => Val.isDefined(CheckSum(d).data),
]);
