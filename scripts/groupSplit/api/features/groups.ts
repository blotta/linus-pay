import {
  createGroup,
  deleteGroup,
  getGroup,
  updateGroup,
  upsertGroupUserMembers,
} from "../../../../src/features/group-split/groupSplit.api";
import { GroupMember } from "../../../../src/features/group-split/groupSplit.types";
import { check, log } from "../../../utils";
import { type ApiContext } from "..";

export default async function runGroup(ctx: ApiContext) {
  // create
  ctx.step = "new group";
  const { data: groupId, error: errorCreateGroup } = await createGroup(
    ctx.supabase,
    "NEW GRP 33",
  );
  check(ctx, groupId, errorCreateGroup);

  ctx.step = "get group";
  const { data: group, error: errorGetGroup } = await getGroup(
    ctx.supabase,
    groupId,
  );
  check(ctx, group, errorGetGroup, { json: true });

  ctx.step = "update group";
  const { data: updateGroupStatus, error: errorUpdateGroup } =
    await updateGroup(ctx.supabase, groupId, {
      name: "NEW GRP 34",
    });
  check(ctx, updateGroupStatus, errorUpdateGroup);

  ctx.step = "upsert group user members";
  {
    const { data } = await getGroup(ctx.supabase, groupId);
    const members: GroupMember[] = data.members;
    log(
      members.map((m) => m.name),
      `${ctx.feature}:${ctx.step}:before first change`,
    );
  }
  const profiles = await ctx.supabase
    .from("profiles")
    .select("id, full_name")
    .neq("id", ctx.user?.id)
    .overrideTypes<{ id: string; full_name: string }[]>();
  const potentialUserMembers = profiles.data!.map((p) => ({
    user_id: p.id,
    name: p.full_name,
  }));
  let members = [
    group.members[0], // admin
    potentialUserMembers[0],
    { user_id: null, name: "Virtual User 1" },
  ];
  const {
    data: upsertGroupUserMembersData,
    error: upsertGroupUserMembersError,
  } = await upsertGroupUserMembers(ctx.supabase, groupId, members);
  check(ctx, upsertGroupUserMembersData, upsertGroupUserMembersError);
  {
    const { data } = await getGroup(ctx.supabase, groupId);
    members = data.members;
    log(
      members.map((m) => m.name),
      `${ctx.feature}:${ctx.step}:after first change`,
    );
  }
  members = [
    group.members[0], // admin
    // potentialUserMembers[0], // keep
    potentialUserMembers[1], // new
    { user_id: null, name: "Virtual User 2" }, // new
  ];
  const {
    data: upsertGroupUserMembersData2,
    error: upsertGroupUserMembersError2,
  } = await upsertGroupUserMembers(ctx.supabase, groupId, members);
  check(ctx, upsertGroupUserMembersData2, upsertGroupUserMembersError2);
  {
    const { data } = await getGroup(ctx.supabase, groupId);
    members = data.members;
    log(
      members.map((m) => m.name),
      `${ctx.feature}:${ctx.step}:after second change`,
    );
  }

  // delete
  ctx.step = "deleted group";
  const { data: deletedGroup, error: deletedError } = await deleteGroup(
    ctx.supabase,
    groupId,
  );
  check(ctx, deletedGroup, deletedError, { json: true });
}
