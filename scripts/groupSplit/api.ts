import { supabase } from "../supabaseNodeClient";
import {
  createGroup,
  getGroup,
  getUserGroups,
} from "../../src/features/group-split/groupSplit.api";
import { exit } from "node:process";

const email = process.env.TEST_USER_EMAIL!;
const password = process.env.TEST_USER_PASSWORD!;

function logJson(obj: object) {
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

{
  const newGroup = await createGroup(supabase, "NEW GRP 33");
  logJson(newGroup);
}
