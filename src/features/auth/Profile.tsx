// import { useProfile } from "@/hooks/useProfile";
import { useProfileStore } from "@/hooks/useProfile";
import {
  Box,
  Button,
  Center,
  Field,
  Heading,
  Input,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState, type FormEvent } from "react";

export default function Profile() {
  const profile = useProfileStore((s) => s.profile);
  const fetchingProfile = useProfileStore((s) => s.fetching);
  const updatingProfile = useProfileStore((s) => s.updating);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [fullName, setFullName] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfile({ full_name: fullName.trim() });
  };

  useEffect(() => {
    const fillProfileForm = async () => {
      if (profile?.full_name) {
        setFullName(profile!.full_name);
      }
    };
    fillProfileForm();
  }, [profile]);

  return (
    <Box p="10" shadow="lg" background="bg.subtle" borderRadius="20px">
      <form onSubmit={handleSubmit}>
        <Stack gap="8">
          <Heading textAlign="center">Profile</Heading>

          {fetchingProfile ? (
            <Center>
              <Spinner />
            </Center>
          ) : (
            <>
              <Field.Root>
                <Field.Label>Name</Field.Label>
                <Input
                  type="text"
                  required
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                />
              </Field.Root>

              <Button
                loading={updatingProfile}
                disabled={updatingProfile}
                type="submit"
              >
                Save
              </Button>
            </>
          )}
        </Stack>
      </form>
    </Box>
  );
}
