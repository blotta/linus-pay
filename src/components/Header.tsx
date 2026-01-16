import { supabase } from "@/helper/supabaseClient";
import { useProfile } from "@/hooks/useProfile";
import {
  Avatar,
  Box,
  Flex,
  Heading,
  HStack,
  Menu,
  Portal,
  SkeletonCircle,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { profile, loading: loadingProfile } = useProfile();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };

  return (
    <Box borderBottomWidth="1px" px={4} py={2} background="gray.subtle">
      <Flex align="center">
        <NavLink to="/">
          <Heading size="xl">
            Linus
            <Text as="span" color="yellow.focusRing">
              Pay
            </Text>
          </Heading>
        </NavLink>
        <Spacer />
        <HStack>
          <NavLink to="/group-split">
            {({ isActive }) => (
              <Text color={isActive ? "yellow" : "white"}>Group Split</Text>
            )}
          </NavLink>
        </HStack>
        <Spacer />
        <Menu.Root positioning={{ placement: "bottom" }}>
          <Menu.Trigger rounded="full" focusRing="outside">
            {loadingProfile ? (
              <SkeletonCircle size="10" />
            ) : (
              <Avatar.Root>
                <Avatar.Fallback name={profile?.full_name ?? "User"} />
                <Avatar.Image src={profile?.avatar_url ?? undefined} />
              </Avatar.Root>
            )}
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item onClick={() => navigate("/profile")} value="profile">
                  Profile
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item onClick={signOut} value="signout">
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Box>
  );
}
