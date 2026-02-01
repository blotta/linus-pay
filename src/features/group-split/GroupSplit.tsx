import { Outlet } from "react-router";
import GroupSelection from "./GroupSelection";
import { Flex, Box } from "@chakra-ui/react";
import { useGroupSplit } from "./hooks/useGroupSplit";

export default function GroupSplit() {
  const { selectedGroup } = useGroupSplit();
  return (
    <Flex direction="column" h="100%">
      <GroupSelection />
      {selectedGroup && (
        <Box
          flex="1"
          shadow="lg"
          background="bg.subtle"
          borderRadius={{ sm: "20px", smDown: "0" }}
          borderTopRadius={{ smDown: "20px" }}
        >
          <Outlet />
        </Box>
      )}
    </Flex>
  );
}
