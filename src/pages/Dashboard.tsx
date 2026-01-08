import { useNavigate } from "react-router";
import { supabase } from "../helper/supabaseClient";
import { Box, Button, Flex, Heading, Spacer, Text } from "@chakra-ui/react";

export default function Dashboard() {
  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate("/login");
  };
  return (
    <Box borderBottomWidth="1px" px={4} py={2} background="gray.subtle">
      <Flex align="center">
        <Heading size="md">
          Linus
          <Text as="span" color="yellow.focusRing">
            Pay
          </Text>
        </Heading>
        <Spacer />
        <Button onClick={signOut} variant="surface" size="sm">
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
