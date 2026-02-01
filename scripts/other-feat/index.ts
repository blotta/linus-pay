import "../supabase-auth";
// import { supabase } from "../supabaseNodeClient";
import { check, Val } from "../utils";

await check(
  "desc",
  { data: "ok", error: null },
  ["validateOk", (d) => d.data != "ok"],
  ["validateErr", () => Val.error("its not ok")],
  ["validateOther", () => Val.ok("its ok")],
);
