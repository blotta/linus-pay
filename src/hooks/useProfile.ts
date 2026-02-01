import {
  getProfile,
  searchProfiles,
  updateProfile,
  type Profile,
} from "@/api/profile.api";
import { useAuth } from "@/auth/useAuth";
import { supabase } from "@/helper/supabaseClient";
import { useEffect, useState } from "react";
import { create } from "zustand";

type ProfileState = {
  profile: Profile | null;
  fetching: boolean;
  updating: boolean;
  error: string | null;

  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: { full_name: string }) => Promise<void>;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  fetching: false,
  updating: false,
  error: null,

  loadProfile: async (userId: string) => {
    set({ fetching: true, error: null });
    const { data, error } = await getProfile(supabase, userId);
    if (error) {
      set({ error, fetching: false });
      return;
    }
    set({ profile: data, fetching: false });
  },

  updateProfile: async (updates: { full_name: string }) => {
    const profile = get().profile;
    if (!profile) return;

    set({ updating: true, error: null });
    const { error } = await updateProfile(supabase, profile.id, updates);
    if (error) {
      set({ error, updating: false });
      return;
    }
    set({ updating: false, profile: { ...profile, ...updates } });
  },
  clear: () => {
    set({ profile: null, fetching: false, updating: false, error: null });
  },
}));

export function useProfiles() {
  const { userId } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [exclude, setExclude] = useState<string[]>([]);
  const [minLength, setMinLength] = useState<number>(3);

  useEffect(() => {
    const loadProfiles = async () => {
      if (userId == null || search.length < minLength) {
        setProfiles([]);
        return;
      }

      setLoading(true);

      const { data, error } = await searchProfiles(supabase, search, exclude);

      if (error) {
        setError(error);
        console.log(error);
        setLoading(false);
        return;
      }

      setProfiles(data!);

      setLoading(false);
    };

    loadProfiles();
  }, [userId, search, exclude, minLength]);

  return {
    profiles,
    loading,
    error,
    search,
    setSearch,
    setExclude,
    setMinLength,
  };
}
