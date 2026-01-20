import { supabase } from "../supabaseNodeClient";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getUserGroups,
  updateGroup,
  upsertGroupUserMembers,
} from "../../src/features/group-split/groupSplit.api";
import { exit } from "node:process";

const email = process.env.TEST_USER_EMAIL!;
const password = process.env.TEST_USER_PASSWORD!;

const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

if (authError) {
  console.error("error signing in", authError);
  exit();
}

console.log(`logged in as ${authData.user.email} (${authData.user.id})`);

let FEATURE = "";
let STEP = "";

function log(
  obj: object | string,
  title: string | null = null,
  opts: { json: boolean } = { json: false },
) {
  const l = [];
  if (title) {
    l.push(`[${title}]:`);
  }
  if (opts.json) {
    l.push(JSON.stringify(obj, null, 2));
  } else {
    l.push(obj);
  }
  console.log(...l);
}

function check(
  data: object | string,
  error: string,
  opts: { json: boolean } = { json: false },
) {
  if (error) {
    log(error, `${FEATURE}:${STEP}:ERROR`);
    exit();
  }
  log(data, `${FEATURE}:${STEP}:OK`, opts);
}

async function runUserGroups() {
  FEATURE = "User Groups";

  STEP = "get user groups";
  const { data: userGroups, error: getUserGroupsError } = await getUserGroups(
    supabase,
    authData.user!.id,
  );
  check(userGroups, getUserGroupsError, { json: true });
}

async function runGroup() {
  FEATURE = "Group";
  // create
  STEP = "new group";
  const { data: groupId, error: errorCreateGroup } = await createGroup(
    supabase,
    "NEW GRP 33",
  );
  check(groupId, errorCreateGroup);

  STEP = "get group";
  const { data: group, error: errorGetGroup } = await getGroup(
    supabase,
    groupId,
  );
  check(group, errorGetGroup, { json: true });

  STEP = "update group";
  const { data: updateGroupStatus, error: errorUpdateGroup } =
    await updateGroup(supabase, groupId, {
      name: "NEW GRP 34",
    });
  check(updateGroupStatus, errorUpdateGroup);

  STEP = "upsert group user members";
  {
    const { data } = await getGroup(supabase, groupId);
    log(data, STEP, { json: true });
  }
  const profiles = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("id", authData.user?.id)
    .overrideTypes<{ id: string; full_name: string }[]>();
  const potentialMembers = profiles.data!.map((p) => ({
    user_id: p.id,
    name: p.full_name,
  }));
  const members = [...group.members, potentialMembers[0]];
  const {
    data: upsertGroupUserMembersData,
    error: upsertGroupUserMembersError,
  } = await upsertGroupUserMembers(supabase, groupId, members);
  check(upsertGroupUserMembersData, upsertGroupUserMembersError);
  {
    const { data } = await getGroup(supabase, groupId);
    log(data, STEP, { json: true });
  }

  // delete
  STEP = "deleted group";
  const { data: deletedGroup, error: deletedError } = await deleteGroup(
    supabase,
    groupId,
  );
  check(deletedGroup, deletedError, { json: true });
}

await runGroup();
await runUserGroups();
