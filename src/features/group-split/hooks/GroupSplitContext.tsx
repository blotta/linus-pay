import { createContext } from "react";
import type { UserGroup } from "../groupSplit.api";
import type { Group } from "../groupSplit.types";

export type GroupSplitContextType = {
  groups: UserGroup[];
  selectedGroup: Group | null;
  loadingGroups: boolean;
  loadingGroup: boolean;
  loadingGroupCreateUpdateDelete: boolean;
  error: string | null;
  createGroup: (name: string) => Promise<string | null>;
  updateGroup: (id: string, values: { name: string }) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<Group | null>;
  upsertUserMembers: (
    group_id: string | null,
    members: { user_id: string | null; name: string }[],
  ) => Promise<void>;
};

export const GroupSplitContext = createContext<GroupSplitContextType | null>(
  null,
);
