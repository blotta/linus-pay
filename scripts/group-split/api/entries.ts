import {
  addEntry,
  createGroup,
  deleteGroup,
  EntryWithoutId,
  getEntries,
  getEntry,
  getGroup,
  setEntrySplits,
  updateEntry,
  upsertGroupUserMembers,
} from "../../../src/features/group-split/groupSplit.api";
import {
  Entry,
  EntrySplit,
  GroupMember,
} from "../../../src/features/group-split/groupSplit.types";
import { check, Val } from "../../utils";
import user from "../../supabase-auth";
import { supabase } from "../../supabaseNodeClient";

// setup
const { data: groupId } = await createGroup(supabase, `TEST GROUP`);
const { data: group } = await getGroup(supabase, groupId);
const { data } = await upsertGroupUserMembers(supabase, groupId, [
  group.members[0], // admin
  { user_id: null, name: "Virtual User 2" }, // new
]);
const members: GroupMember[] = data as GroupMember[];

const memberId1 = members.find((m) => m.user_id == user.id)!.id;
const memberId2 = members.find((m) => m.user_id != user.id)!.id;

const entryWithoutId: EntryWithoutId = {
  description: `TEST ENTRY`,
  amount: 100,
  date: new Date(),
  group_id: groupId,
  member_id: memberId1,
  installment: 1,
  installments: 1,
  obs: null,
  payment_type: "credit-card",
  splits: [
    {
      member_id: memberId1,
      split_type: "amount",
      amount: 20,
      percentage: null,
    },
    {
      member_id: memberId2,
      split_type: "remainder",
      amount: null,
      percentage: null,
    },
  ],
};

const entryAdded = await addEntry(supabase, entryWithoutId);
await check("added entry", entryAdded, [
  "entryId",
  (d) => Val.isDefined(d.data),
]);

const fetchedEntry = await getEntry(supabase, entryAdded.data);
await check("fetched entry", fetchedEntry, [
  "exists",
  (d) => Val.isDefined(d.data),
]);

const entry: Entry = fetchedEntry.data!;

entry.description = "TEST ENTRY - UPDATED";
const updatedEntry = await updateEntry(supabase, entry);
await check(
  "updated entry",
  updatedEntry,
  ["success", (d) => d.data],
  [
    "db",
    async () => {
      const { data } = await getEntry(supabase, entry.id);
      const e: Entry = data!;
      return [["description match", e.description === entry.description]];
    },
  ],
);

const fetchedEntries = await getEntries(supabase, groupId);
await check(
  "get group entries",
  fetchedEntries,
  ["exists", (d) => Val.isDefined(d.data)],
  ["has created entry", (d) => d.data.length > 0 && d.data[0].id === entry.id],
);

const splits: EntrySplit[] = entry.splits;

const settedEntrySplits = await setEntrySplits(supabase, entry.id, [
  {
    ...splits.find((s) => s.split_type == "amount")!, // keep first
    amount: 30, // but change the amount
  },
  {
    entry_id: entry.id,
    member_id: memberId2,
    split_type: "amount",
    amount: 70,
    percentage: null,
  },
]);
await check(
  "set new entry splits",
  settedEntrySplits,
  ["success", (d) => d.data],
  [
    "db",
    async () => {
      const { data } = await getEntry(supabase, entry.id);
      const e: Entry = data!;
      return [
        ["length", e.splits.length === 2],
        [
          "member1",
          e.splits[0].member_id === memberId1 && e.splits[0].amount === 30,
        ],
        [
          "member2",
          e.splits[1].member_id === memberId2 && e.splits[1].amount === 70,
        ],
      ];
    },
  ],
);

// cleanup
await deleteGroup(supabase, groupId);
