import { getProfile, type Profile } from "@/api/profile.api";
import { supabase } from "@/helper/supabaseClient";
import { useProfile, useProfiles } from "@/hooks/useProfile";
import { colorFromUuid } from "@/utils/colors";
import {
  Avatar,
  Box,
  Combobox,
  createListCollection,
  HStack,
  IconButton,
  Span,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useEffectEvent, useState } from "react";
import { CgClose } from "react-icons/cg";

interface ProfileSelectSearchProps {
  initialIds: string[];
  onValueChange: (p: Profile[]) => void;
}

export default function ProfileSelectSearch({
  initialIds,
  onValueChange,
}: ProfileSelectSearchProps) {
  const { profile } = useProfile();
  const { profiles, search, setSearch, setExclude, loading, error } =
    useProfiles();
  const [selectedProfileIds, setSelectedProfileIds] =
    useState<string[]>(initialIds);
  const [selectedProfiles, setSelectedProfiles] = useState<Profile[]>([]);

  // set admin profile
  const addProfile = useEffectEvent((pid: string) => {
    if (selectedProfileIds.length == 0) {
      setSelectedProfileIds([pid]);
    }
    setExclude([...selectedProfileIds]);
  });
  useEffect(() => {
    if (profile) {
      addProfile(profile.id);
    }
  }, [profile]);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!profile) {
        return;
      }
      if (!selectedProfileIds.includes(profile!.id)) {
        setSelectedProfileIds([profile!.id]);
        setExclude([profile!.id]);
      }
      const profs: Profile[] = [];
      for (const pid of selectedProfileIds) {
        if (pid == profile?.id) {
          profs.push(profile);
        } else {
          let otherProfile = profiles.find((p) => p.id === pid) ?? null;
          if (!otherProfile) {
            otherProfile = selectedProfiles.find((p) => p.id === pid) ?? null;
          }
          if (!otherProfile) {
            const { data, error } = await getProfile(supabase, pid);
            if (error) {
              console.log(error);
              return;
            } else {
              otherProfile = data;
            }
          }
          if (otherProfile) {
            profs.push(otherProfile);
          }
        }
      }
      setSelectedProfiles(profs);
      onValueChange(profs);
    };
    fetchProfiles();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [selectedProfileIds, profile, profiles]);

  const handleValueChange = (details: Combobox.ValueChangeDetails) => {
    setSelectedProfileIds(details.value);
    setExclude(details.value);
  };

  const handleRemoveProfile = (id: string) => {
    setSelectedProfileIds((prev) => [...prev.filter((pid) => pid !== id)]);
    setExclude((prev) => [...prev.filter((p) => p !== id)]);
  };

  const collection = createListCollection({
    items: [...profiles.map((p) => ({ label: p.full_name, value: p.id }))],
  });

  return (
    <>
      <VStack align="start" gap="2" width="100%">
        {error && <p>{error}</p>}

        <Combobox.Root
          multiple
          value={selectedProfileIds}
          collection={collection}
          onValueChange={handleValueChange}
          onInputValueChange={(e) => setSearch(e.inputValue)}
          inputValue={search}
        >
          <Combobox.Label>Members</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input placeholder="Type to search" />
            <Combobox.IndicatorGroup>
              {/*<Combobox.ClearTrigger />*/}
              <Combobox.Trigger />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Combobox.Positioner>
            <Combobox.Content>
              {loading ? (
                <HStack p="2">
                  <Spinner size="xs" borderWidth="1px" />
                  <Span>Loading...</Span>
                </HStack>
              ) : (
                collection.items.map((item) => (
                  <Combobox.Item item={item} key={item.value}>
                    <HStack>
                      <Avatar.Root colorPalette={colorFromUuid(item.value)}>
                        <Avatar.Fallback name={item.label} />
                        <Avatar.Image
                          src={
                            profiles.find((p) => p.id === item.value)
                              ?.avatar_url ?? undefined
                          }
                        />
                      </Avatar.Root>
                      {item.label}
                    </HStack>
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                ))
              )}
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Root>

        {selectedProfiles.map((p) => (
          <Box
            key={p.id}
            bg="gray.subtle"
            p="2"
            width="100%"
            border="1px solid"
            borderColor="gray.border"
            borderRadius="4px"
          >
            <HStack gap="4">
              <Avatar.Root>
                <Avatar.Fallback name={p.full_name} />
                <Avatar.Image src={p.avatar_url ?? undefined} />
              </Avatar.Root>
              <Text marginEnd="auto">
                {p.full_name + (profile?.id == p.id ? " (You)" : "")}
              </Text>
              {profile?.id != p.id && (
                <IconButton
                  variant="ghost"
                  color="red.muted"
                  onClick={() => handleRemoveProfile(p.id)}
                  _hover={{ color: "red.solid" }}
                >
                  <CgClose />
                </IconButton>
              )}
            </HStack>
          </Box>
        ))}
      </VStack>
    </>
  );
}
