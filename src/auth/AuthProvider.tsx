import { supabase } from "@/helper/supabaseClient";
import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "@supabase/supabase-js";
import { useProfileStore } from "@/hooks/useProfile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const clearProfile = useProfileStore((s) => s.clear);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        clearProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [clearProfile, loadProfile]);

  return (
    <AuthContext.Provider value={{ user, userId: user?.id ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
