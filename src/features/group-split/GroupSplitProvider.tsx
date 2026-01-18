import { useAuth } from "@/auth/useAuth";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGroup, getUserGroups, type UserGroup } from "./groupSplit.api";
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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [loadingGroup, setLoadingGroup] = useState<boolean>(false);
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
  }, [userId]);

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
  }, [groupId, groups, navigate]);

  return (
    <GroupSplitContext.Provider
      value={{ groups, selectedGroup, loadingGroups, loadingGroup, error }}
    >
      {children}
    </GroupSplitContext.Provider>
  );
}
