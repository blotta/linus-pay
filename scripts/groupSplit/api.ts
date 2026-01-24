import { supabase } from "../supabaseNodeClient";
import { exit } from "node:process";
import { SupabaseClient, User } from "@supabase/supabase-js";
import runGroup from "./features/groups";
import runUserGroups from "./features/user-groups";
import runEntries from "./features/entries";

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

export type RunContext = {
  user: User;
  supabase: SupabaseClient;
  feature: string;
  step: string;
};

const runContext: RunContext = {
  user: authData.user,
  supabase: supabase,
  feature: "",
  step: "",
};

type FeatureFn = (ctx: RunContext) => Promise<void>;

const features: { feature: string; fn: FeatureFn }[] = [
  { feature: "Group", fn: runGroup },
  { feature: "UserGroups", fn: runUserGroups },
  { feature: "Entries", fn: runEntries },
];

for (const f of features) {
  runContext.feature = f.feature;
  await f.fn(runContext);
}
