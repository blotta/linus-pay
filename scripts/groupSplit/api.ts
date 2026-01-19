import { supabase } from "../supabaseNodeClient";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getUserGroups,
  updateGroup,
} from "../../src/features/group-split/groupSplit.api";
import { exit } from "node:process";

const email = process.env.TEST_USER_EMAIL!;
const password = process.env.TEST_USER_PASSWORD!;

function logJson(obj: object, title: string | null = null) {
  if (title) {
    console.log(title);
  }
  console.log(JSON.stringify(obj, null, 2));
}

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

const userGroups = await getUserGroups(supabase, authData.user!.id);
logJson(userGroups);

const group = await getGroup(supabase, userGroups.data![0].id);
logJson(group);

async function runGroups() {
  const newGroup = await createGroup(supabase, "NEW GRP 33");
  logJson(newGroup, "new group");

  const updateGroupStatus = await updateGroup(supabase, newGroup.data!, {
    name: "NEW GRP 34",
  });

  console.log(updateGroupStatus);
  if (updateGroupStatus.error) {
    console.log("error updating group", updateGroupStatus.error);
  } else {
    const updatedGroup = await getGroup(supabase, newGroup.data!);
    logJson(updatedGroup, "updated group");
  }

  const deletedGroup = await deleteGroup(supabase, newGroup.data!);
  logJson(deletedGroup, "deleted group");
}

await runGroups();
