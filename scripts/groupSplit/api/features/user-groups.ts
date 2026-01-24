import { getUserGroups } from "../../../../src/features/group-split/groupSplit.api";
import { check } from "../../../utils";
import { type ApiContext } from "..";

export default async function runUserGroups(ctx: ApiContext) {
  ctx.step = "get user groups";
  const { data: userGroups, error: getUserGroupsError } = await getUserGroups(
    ctx.supabase,
    ctx.user!.id,
  );
  check(ctx, userGroups, getUserGroupsError, { json: true });
}
