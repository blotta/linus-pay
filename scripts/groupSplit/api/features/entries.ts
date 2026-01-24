import {
  addEntry,
  createGroup,
  deleteGroup,
  getEntries,
  getGroup,
  upsertGroupUserMembers,
} from "../../../../src/features/group-split/groupSplit.api";
import { GroupMember } from "../../../../src/features/group-split/groupSplit.types";
import { check } from "../../../utils";
import { type ApiContext } from "..";

export default async function runEntries(ctx: ApiContext) {
  // setup
  const { data: groupId } = await createGroup(ctx.supabase, "NEW GRP ENTRIES");
  const { data: group } = await getGroup(ctx.supabase, groupId);
  const { data } = await upsertGroupUserMembers(ctx.supabase, groupId, [
    group.members[0], // admin
    { user_id: null, name: "Virtual User 2" }, // new
  ]);
  const members: GroupMember[] = data as GroupMember[];

  const memberId1 = members.find((m) => m.user_id == ctx.user!.id)!.id;
  const memberId2 = members.find((m) => m.user_id != ctx.user!.id)!.id;

  ctx.step = "ADD ENTRY";
  const { data: entryId, error: errorAddEntry } = await addEntry(ctx.supabase, {
    description: "something",
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
  });
  check(ctx, entryId, errorAddEntry);

  ctx.step = "GET GROUP ENTRIES";
  const { data: entries, error: errorGetEntries } = await getEntries(
    ctx.supabase,
    groupId,
  );
  check(ctx, entries, errorGetEntries, { json: true });

  await deleteGroup(ctx.supabase, groupId);
}
