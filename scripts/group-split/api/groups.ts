import {
  createGroup,
  deleteGroup,
  getGroup,
  updateGroup,
  upsertGroupUserMembers,
} from "../../../src/features/group-split/groupSplit.api";
import { Group } from "../../../src/features/group-split/groupSplit.types";
import { supabase } from "../../supabaseNodeClient";
import { check, Val } from "../../utils";
import user from "../../supabase-auth";

// create
const created = await createGroup(supabase, "TEST GROUP");
await check("new group", created, ["groupId", (d) => Val.isDefined(d.data)]);

const groupId = created.data! as string;

// fetch
const fetchedGroup = await getGroup(supabase, groupId);
await check("get group", fetchedGroup, ["group", (d) => Val.isDefined(d.data)]);

let group = fetchedGroup.data! as Group;

// update
const updated = await updateGroup(supabase, groupId, {
  name: "TEST GROUP - UPDATED",
});
await check(
  "update group",
  updated,
  [
    "update returns success",
    (d) => {
      console.log(d);
      return d.data === true;
    },
  ],
  [
    "updated group name",
    async () => {
      const resp = await getGroup(supabase, groupId);
      const result = resp.data?.name === "TEST GROUP - UPDATED";
      if (result) {
        group = resp.data!;
      }
      return result;
    },
  ],
);

const profiles = await supabase
  .from("profiles")
  .select("id, full_name")
  .neq("id", user.id)
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
const upsertedMembers1 = await upsertGroupUserMembers(
  supabase,
  groupId,
  members,
);
await check(
  "first group members change",
  upsertedMembers1,

  ["group contains 3 members", (d) => d.data.length === 3],
);
group.members = upsertedMembers1.data!;

members = [
  group.members[0], // admin
  // potentialUserMembers[0], // keep
  potentialUserMembers[1], // new
  // (removed Virtual User 1)
  { user_id: null, name: "Virtual User 2" }, // new
];
const upsertedMembers2 = await upsertGroupUserMembers(
  supabase,
  groupId,
  members,
);
await check(
  "second group members change",
  upsertedMembers2,
  ["group contains 3 members", (d) => d.data.length === 3],
  [
    "db check",
    async (d) => {
      const fetched = await getGroup(supabase, groupId);
      const g = fetched.data as Group;

      return [
        ["members length match", g.members.length === d.data.length],
        [
          "does not have virtual user 1",
          g.members.find((m) => m.name == "Virtual User 1") == undefined,
        ],
      ];
    },
  ],
);

// delete
const deletedGroup = await deleteGroup(supabase, groupId);
await check("deleted group", deletedGroup, [
  "group deleted",
  (d) => Val.isDefined(d.data),
]);
