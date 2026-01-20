import {
  getProfile,
  searchProfiles,
  updateProfile,
  type Profile,
} from "@/api/profile.api";
import { useAuth } from "@/auth/useAuth";
import { supabase } from "@/helper/supabaseClient";
import { useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (userId == null) {
        return;
      }
      setLoading(true);

      const { data, error } = await getProfile(supabase, userId!);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [userId]);

  const updateProfileFn = async (updates: { full_name: string }) => {
    setLoadingUpdate(true);
    const { error } = await updateProfile(supabase, userId!, updates);

    if (error) {
      setError(error);
    }

    setProfile((s) => ({ ...s, ...updates }) as Profile);

    setLoadingUpdate(false);
  };

  return {
    profile,
    loading,
    error,
    loadingUpdate,
    updateProfile: updateProfileFn,
  };
}

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
