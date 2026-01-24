import { getUserGroups } from "../../../src/features/group-split/groupSplit.api";
import { check } from "../../utils";
import { RunContext } from "../api";

export default async function runUserGroups(ctx: RunContext) {
  ctx.step = "get user groups";
  const { data: userGroups, error: getUserGroupsError } = await getUserGroups(
    ctx.supabase,
    ctx.user!.id,
  );
  check(ctx, userGroups, getUserGroupsError, { json: true });
}
