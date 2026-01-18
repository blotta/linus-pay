import { useContext } from "react";
import { GroupSplitContext } from "./GroupSplitContext";

export function useGroupSplit() {
  const ctx = useContext(GroupSplitContext);
  if (!ctx) {
    throw new Error("useGroupSplit must be used within GroupSplitProvider");
  }
  return ctx;
}
