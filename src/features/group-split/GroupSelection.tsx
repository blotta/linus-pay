import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  Center,
  createListCollection,
  Flex,
  FormatNumber,
  Group,
  Heading,
  HStack,
  Icon,
  IconButton,
  Portal,
  Select,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useGroupSplit } from "./hooks/useGroupSplit";
import { Link as RouterLink } from "react-router";
import { useNavigate } from "react-router";
import { BiEdit, BiPlus, BiPlusCircle } from "react-icons/bi";
import { formatDate } from "@/utils/date";
import FormDrawer from "../../components/FormDrawer";
import GroupForm from "./GroupForm";
import { Tooltip } from "@/components/ui/tooltip";
import { colorFromUuid } from "@/utils/colors";
import { useAuth } from "@/auth/useAuth";

export default function GroupSelection() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { groups, selectedGroup, loadingGroup, loadingGroups } =
    useGroupSplit();

  if (loadingGroups) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  const handleGroupChange = (id: string) => {
    if (id != null && id != "") {
      navigate(`/group-split/${id}`);
    } else {
      navigate("/group-split/");
    }
  };

  if (selectedGroup !== null) {
    const groupItems = createListCollection({
      items: [...groups.map((g) => ({ label: g.name, value: g.id }))],
    });
    return (
      <>
        <Flex
          mb={{ sm: "4" }}
          my={{ smDown: "4" }}
          px="2"
          alignItems="end"
          justifyContent="end"
        >
          <Group attached width={{ base: "300px", smDown: "100%" }}>
            <Select.Root
              collection={groupItems}
              value={[selectedGroup?.id]}
              onValueChange={(e) => handleGroupChange(e.value[0])}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select group" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.ClearTrigger />
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {groupItems.items.map((g) => (
                      <Select.Item item={g} key={g.value}>
                        {g.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {selectedGroup.admin_id === userId && (
              <FormDrawer
                title="Edit Group"
                submitLabel="Save"
                formNode={<GroupForm group_id={selectedGroup.id} />}
              >
                <IconButton variant="outline">
                  <Tooltip content="Edit Group">
                    <BiEdit />
                  </Tooltip>
                </IconButton>
              </FormDrawer>
            )}
          </Group>
          <FormDrawer
            title="Create Group"
            submitLabel="Create"
            formNode={<GroupForm group_id={null} />}
          >
            <IconButton variant="solid" marginLeft="6">
              <Tooltip content="Create Group">
                <BiPlus />
              </Tooltip>
            </IconButton>
          </FormDrawer>
        </Flex>
      </>
    );
  }

  if (loadingGroup) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box p="4">
      <HStack justifyContent="space-between" alignItems="start">
        <Heading mb={{ base: 10, smDown: 4 }}>Select a group</Heading>
        <FormDrawer
          title="Create Group"
          submitLabel="Create"
          formNode={<GroupForm group_id={null} />}
        >
          <Icon size="2xl">
            <BiPlusCircle />
          </Icon>
        </FormDrawer>
      </HStack>
      <SimpleGrid minChildWidth="sm" gap="8" gapY="4">
        {groups.map((g) => (
          <RouterLink key={g.id} to={`/group-split/${g.id}`}>
            <Card.Root _hover={{ bg: "gray.subtle" }}>
              <Card.Header>
                <Card.Title>{g.name}</Card.Title>
                <Card.Description>
                  {formatDate(g.created_at, "dd/MM/yyyy")}
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Flex justifyContent="space-between" alignItems="center">
                  <Text textStyle="lg" color="green.solid">
                    <FormatNumber
                      style="currency"
                      currency="BRL"
                      value={123.32}
                    />
                  </Text>
                  <AvatarGroup>
                    {g.members.map((m) => (
                      <Tooltip key={m.id} content={m.name}>
                        <div>
                          <Avatar.Root
                            colorPalette={colorFromUuid(m.user_id ?? m.id)}
                            size="xs"
                          >
                            <Avatar.Fallback name={m.name} />
                          </Avatar.Root>
                        </div>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Flex>
              </Card.Body>
            </Card.Root>
          </RouterLink>
        ))}
        <FormDrawer
          title="Create Group"
          submitLabel="Create"
          formNode={<GroupForm group_id={null} />}
        >
          <Card.Root bg="gray.subtle" size="lg" _hover={{ bg: "gray.muted" }}>
            <Card.Header>
              <Card.Title>Create New Group</Card.Title>
            </Card.Header>
            <Card.Body>
              <Center>
                <Icon size="2xl">
                  <BiPlusCircle />
                </Icon>
              </Center>
            </Card.Body>
          </Card.Root>
        </FormDrawer>
      </SimpleGrid>
    </Box>
  );
}
