import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createGroup,
  deleteGroup,
  getGroup,
  getUserGroups,
  updateGroup,
  upsertGroupUserMembers,
  type UserGroup,
} from "./groupSplit.api";
import { supabase } from "@/helper/supabaseClient";
import type { Group } from "./groupSplit.types";
import { GroupSplitContext } from "./GroupSplitContext";

export function GroupSplitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [refreshGroups, setRefreshGroups] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(false);
  const [loadingGroupCreateUpdateDelete, setLoadingGroupCreateUpdateDelete] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // fetch groups
  useEffect(() => {
    const loadGroups = async () => {
      if (!userId) return;

      setLoadingGroups(true);
      const { data, error } = await getUserGroups(supabase, userId);
      if (error) {
        setError(error);
        setLoadingGroups(false);
        return;
      }

      setLoadingGroups(false);
      setGroups(data ?? []);
    };
    loadGroups();
  }, [userId, refreshGroups]);

  // sync URL -> selected group
  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) {
        setSelectedGroup(null);
        return;
      }
      setLoadingGroup(true);
      const { data, error } = await getGroup(supabase, groupId);
      if (error) {
        setError(error);
        setLoadingGroup(false);
        navigate("/group-split", { replace: true });
        return;
      }

      setLoadingGroup(false);
      setSelectedGroup(data);
    };

    loadGroup();
  }, [groupId, navigate]);

  const createGroupFn = async (name: string): Promise<string | null> => {
    setLoadingGroupCreateUpdateDelete(true);
    const { data, error } = await createGroup(supabase, name);

    if (error) {
      setError(error);
      setLoadingGroupCreateUpdateDelete(false);
      return null;
    }

    setLoadingGroupCreateUpdateDelete(false);
    setRefreshGroups((s) => s + 1);

    return data;
  };

  const updateGroupFn = async (
    id: string,
    values: { name: string },
  ): Promise<boolean> => {
    setLoadingGroupCreateUpdateDelete(true);
    const { error } = await updateGroup(supabase, id, values);

    if (error) {
      setError(error);
      setLoadingGroupCreateUpdateDelete(false);
      return false;
    }

    setLoadingGroupCreateUpdateDelete(false);
    setRefreshGroups((s) => s + 1);
    setSelectedGroup((g) => {
      return { ...g, ...values } as Group;
    });

    return true;
  };

  const deleteGroupFn = async (id: string): Promise<Group | null> => {
    setLoadingGroupCreateUpdateDelete(true);
    const { data, error } = await deleteGroup(supabase, id);

    if (error) {
      setError(error);
      setLoadingGroupCreateUpdateDelete(false);
      return null;
    }

    setLoadingGroupCreateUpdateDelete(false);
    setRefreshGroups((s) => s + 1);
    navigate("/group-split", { replace: true });

    return data;
  };

  const upsertUserMembersFn = async (
    group_id: string | null,
    members: { user_id: string | null; name: string }[],
  ): Promise<void> => {
    setLoadingGroupCreateUpdateDelete(true);
    const { data, error } = await upsertGroupUserMembers(
      supabase,
      group_id ?? selectedGroup!.id,
      members,
    );

    if (error) {
      setError(error);
      setLoadingGroupCreateUpdateDelete(false);
      return;
    }

    setRefreshGroups((s) => s + 1);
    setSelectedGroup((g) => ({ ...g!, members: data! }));
    setLoadingGroupCreateUpdateDelete(false);
  };

  return (
    <GroupSplitContext.Provider
      value={{
        groups,
        selectedGroup,
        loadingGroups,
        loadingGroup,
        loadingGroupCreateUpdateDelete,
        error,
        createGroup: createGroupFn,
        updateGroup: updateGroupFn,
        deleteGroup: deleteGroupFn,
        upsertUserMembers: upsertUserMembersFn,
      }}
    >
      {children}
    </GroupSplitContext.Provider>
  );
}
