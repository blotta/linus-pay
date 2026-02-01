import { Entry } from "../../../src/features/group-split/groupSplit.types";
import { check } from "../../utils";
import { validateEntrySplits } from "../../../src/features/group-split/groupSplit.validation";

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

const validateNoSplits = validateEntrySplits(entry);
check("entry 100 with no splits", validateNoSplits, [
  "should be invalid",
  (d) => d.valid === false,
]);

entry.splits = [
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
];

const validate_100_A20R = validateEntrySplits(entry);
check("entry 100 with splits A20 R", validate_100_A20R, [
  "valid",
  (d) => d.valid,
]);

entry.splits = [
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
    split_type: "percentage",
    amount: null,
    percentage: 0.1,
  },
  {
    entry_id: "abcd",
    member_id: "member3",
    split_type: "remainder",
    amount: null,
    percentage: null,
  },
];

const validate_100_A20P10R = validateEntrySplits(entry);
check("entry with splits A20 P10 R", validate_100_A20P10R, [
  "valid",
  (d) => d.valid,
]);

entry.splits = [
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
    split_type: "percentage",
    amount: null,
    percentage: 0.1,
  },
];
const validate_100_A20P10 = validateEntrySplits(entry);
check("entry with splits A20 P10", validate_100_A20P10, [
  "invalid",
  (d) => d.valid === false,
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
    split_type: "percentage",
    amount: null,
    percentage: 0.8,
  },
];
const validate_100_P20P80 = validateEntrySplits(entry);
check("entry 100 with splits P20 P80", validate_100_P20P80, [
  "valid",
  (d) => d.valid,
]);
