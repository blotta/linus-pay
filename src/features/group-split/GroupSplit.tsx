import { Outlet } from "react-router";
import GroupSelection from "./GroupSelection";
import { Box, Spacer } from "@chakra-ui/react";
import { useGroupSplit } from "./useGroupSplit";

export default function GroupSplit() {
  const { selectedGroup } = useGroupSplit();
  return (
    <>
      <GroupSelection />
      <Spacer h="10" />
      {selectedGroup && (
        <Box p="10" shadow="lg" background="bg.subtle" borderRadius="20px">
          <Outlet />
        </Box>
      )}
    </>
  );

  // const [data] = useState<Entry[]>([...defaultData]);
  // return <DataTable<Entry> data={data} columns={columns} />;
}
