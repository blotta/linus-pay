import { test, describe, expect, beforeAll } from "vitest";
import {
  createGroup,
  deleteGroup,
  getGroup,
  updateGroup,
} from "../src/features/group-split/groupSplit.api";
import { supabase } from "../scripts/supabaseNodeClient";

describe("groups", () => {
  beforeAll(async () => {
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    await supabase.auth.signInWithPassword({
      email,
      password,
    });
  });

  // create
  test("creates, updated and deletes a group", async () => {
    const created = await createGroup(supabase, "TEST GROUP");
    expect(created.error).toBeNull();

    const groupId = created.data!;

    const fetched = await getGroup(supabase, groupId);
    expect(fetched.data?.name).toBe("TEST GROUP");

    const updated = await updateGroup(supabase, groupId, {
      name: "TEST GROUP - UPDATED",
    });
    expect(updated.error).toBeNull();

    const fetchedAfterUpdate = await getGroup(supabase, groupId);
    expect(fetchedAfterUpdate.data?.name).toBe("TEST GROUP - UPDATED");

    const deleted = await deleteGroup(supabase, groupId);
    expect(deleted.data?.id).toBe(groupId);

    const afterDelete = await getGroup(supabase, groupId);
    expect(afterDelete.data).toBeNull();
  });
});
