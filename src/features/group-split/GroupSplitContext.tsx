import { createContext } from "react";
import type { UserGroup } from "./groupSplit.api";
import type { Group } from "./groupSplit.types";

export type GroupSplitContextType = {
  groups: UserGroup[];
  selectedGroup: Group | null;
  loadingGroups: boolean;
  loadingGroup: boolean;
  error: string | null;
};

export const GroupSplitContext = createContext<GroupSplitContextType | null>(
  null,
);
