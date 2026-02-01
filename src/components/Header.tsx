import { supabase } from "@/helper/supabaseClient";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  Avatar,
  Box,
  Drawer,
  Flex,
  Heading,
  Icon,
  Menu,
  Portal,
  SkeletonCircle,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { Tooltip } from "./ui/tooltip";
import { colorFromUuid } from "@/utils/colors";
import { useProfileStore } from "@/hooks/useProfile";

export default function Header() {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const fetchingProfile = useProfileStore((s) => s.fetching);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };

  return (
    <Box borderBottomWidth="1px" px={4} py={2} background="gray.subtle">
      <Flex align="center">
        <Drawer.Root placement="start" size="xs">
          <Drawer.Trigger asChild>
            <Icon mr="2" size="md">
              <GiHamburgerMenu />
            </Icon>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>MENU</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <VStack align="start" spaceY="6">
                    <NavLink to="/group-split">
                      {({ isActive }) => (
                        <Text
                          fontSize="xl"
                          color={isActive ? "yellow.focusRing" : "white"}
                        >
                          GROUP SPLIT
                        </Text>
                      )}
                    </NavLink>
                  </VStack>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        <NavLink to="/">
          <Heading size="xl">
            Linus
            <Text as="span" color="yellow.focusRing">
              Pay
            </Text>
          </Heading>
        </NavLink>

        <Spacer />

        <Menu.Root positioning={{ placement: "bottom" }}>
          <Menu.Trigger rounded="full" focusRing="outside">
            {!profile || fetchingProfile ? (
              <SkeletonCircle size="10" />
            ) : (
              <Tooltip content={profile?.full_name}>
                <div>
                  <Avatar.Root colorPalette={colorFromUuid(profile!.id)}>
                    <Avatar.Fallback name={profile?.full_name} />
                    <Avatar.Image src={profile?.avatar_url ?? undefined} />
                  </Avatar.Root>
                </div>
              </Tooltip>
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
