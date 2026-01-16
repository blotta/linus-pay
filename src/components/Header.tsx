import { supabase } from "@/helper/supabaseClient";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

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
        <Button onClick={signOut} variant="surface" size="sm">
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
