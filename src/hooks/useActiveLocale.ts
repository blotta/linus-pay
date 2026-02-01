import { getBrowserLocale } from "@/utils/locale";
import { useProfileStore } from "./useProfile";

export function useActiveLocale() {
  const profile = useProfileStore((s) => s.profile);
  const fetching = useProfileStore((s) => s.fetching);

  if (fetching || !profile) {
    return getBrowserLocale();
  }

  // return profile.locale ?? getBrowserLocale()
  return getBrowserLocale();
}
