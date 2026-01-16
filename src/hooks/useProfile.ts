import { supabase } from "@/helper/supabaseClient";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", auth.user.id)
        .single();

      if (error) setError(error.message);
      else setProfile({ ...data, email: auth.user.email! });

      setLoading(false);
    };

    loadProfile();
  }, []);

  return { profile, loading, error };
}
