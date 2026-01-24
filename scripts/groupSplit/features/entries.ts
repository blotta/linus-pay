import {
  addEntry,
  createGroup,
  deleteGroup,
  getEntries,
  getGroup,
} from "../../../src/features/group-split/groupSplit.api";
import { GroupMember } from "../../../src/features/group-split/groupSplit.types";
import { check } from "../../utils";
import { RunContext } from "../api";

export default async function runEntries(ctx: RunContext) {
  // create
  const { data: groupId } = await createGroup(ctx.supabase, "NEW GRP ENTRIES");
  const { data: group } = await getGroup(ctx.supabase, groupId);
  const members: GroupMember[] = group.members;

  ctx.step = "ADD ENTRY";
  const { data: entryId, error: errorAddEntry } = await addEntry(ctx.supabase, {
    description: "something",
    amount: 321.2,
    date: new Date(),
    group_id: groupId,
    member_id: members.find((m) => m.user_id == ctx.user!.id)!.id,
    installment: 1,
    installments: 1,
    obs: null,
    payment_type: "credit-card",
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
