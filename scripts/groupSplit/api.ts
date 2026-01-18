import { supabase } from "../supabaseNodeClient";
import {
  getGroup,
  getUserGroups,
} from "../../src/features/group-split/groupSplit.api";
import { exit } from "node:process";

const email = process.env.TEST_USER_EMAIL!;
const password = process.env.TEST_USER_PASSWORD!;

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  console.error("error signing in", error);
  exit();
}

console.log(`logged in as ${data.user.email} (${data.user.id})`);

const userGroups = await getUserGroups(supabase, data.user!.id);
console.log(JSON.stringify(userGroups, null, 2));

const group = await getGroup(supabase, userGroups.data![0].id);
console.log(JSON.stringify(group, null, 2));
