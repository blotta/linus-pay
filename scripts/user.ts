import { exit } from "process";
import { supabase } from "./supabaseNodeClient";
import { searchProfiles } from "../src/api/profile.api";

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

logJson(await searchProfiles(supabase, "luc"));
