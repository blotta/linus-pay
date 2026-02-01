import { getUserGroups } from "../../../src/features/group-split/groupSplit.api";
import { check, Val } from "../../utils";
import user from "../../supabase-auth";
import { supabase } from "../../supabaseNodeClient";

const fetchedUserGroups = await getUserGroups(supabase, user.id);
await check("fetched user groups", fetchedUserGroups, [
  "exists",
  (d) => Val.isDefined(d.data),
]);
