import { exit } from "process";
import { supabase } from "./supabaseNodeClient";

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

export default authData.user!;
