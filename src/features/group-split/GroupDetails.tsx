import { Center, Heading, Spinner } from "@chakra-ui/react";
import { useGroupSplit } from "./useGroupSplit";

export default function GroupDetails() {
  const { selectedGroup, loadingGroup } = useGroupSplit();

  if (loadingGroup) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }
  return (
    <>
      <Heading> {selectedGroup?.name}</Heading>
    </>
  );
}
