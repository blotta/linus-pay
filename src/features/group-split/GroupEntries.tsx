import { useGroupSplit } from "./useGroupSplit";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  createListCollection,
  Flex,
  FormatNumber,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Listbox,
  LocaleProvider,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEntries } from "./useEntries";
import { formatDate } from "@/utils/date";
import { colorFromUuid } from "@/utils/colors";
import FormDrawer from "@/components/FormDrawer";
import EntryForm from "./EntryForm";
import { useAuth } from "@/auth/useAuth";
import type { Entry } from "./groupSplit.types";
import { BiEditAlt } from "react-icons/bi";

export default function GroupEntries() {
  const { userId } = useAuth();
  const { selectedGroup, loadingGroup } = useGroupSplit();
  const { entries, fetching, currentGroupId } = useEntries(selectedGroup!.id);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>(
    undefined,
  );
  const selEntry = useMemo<Entry | undefined>(() => {
    if (selectedEntryId === undefined) {
      return undefined;
    }

    return entries.find((e) => e.id === selectedEntryId);
  }, [entries, selectedEntryId]);

  const memberById = useMemo(() => {
    return new Map(selectedGroup!.members.map((m) => [m.id, m]));
  }, [selectedGroup]);

  const memberByUserId = useMemo(() => {
    return new Map(
      selectedGroup!.members
        .filter((m) => m.user_id != null)
        .map((m) => [m.user_id, m]),
    );
  }, [selectedGroup]);

  const handleEntryChange = (entryId: string) => {
    setSelectedEntryId(entryId);
  };

  const collection = useMemo(() => {
    const items = entries.map((entry) => ({
      value: entry.id,
      title: entry.description,
      member_id: entry.member_id,
      date: entry.date,
      amount: entry.amount,
    }));
    return createListCollection({
      items: items,
    });
  }, [entries]);

  useEffect(() => {
    // if group changed, allow for useEntries to fetch group entries first
    if (true == initialLoading && selectedGroup!.id == currentGroupId) {
      /* eslint-disable-next-line  */
      setInitialLoading(false);
    }
  }, [initialLoading, selectedGroup, currentGroupId]);

  if (loadingGroup || initialLoading || fetching) {
    return (
      <>
        <p>loading</p>
      </>
    );
  }

  const gridSizes = {
    top: {
      lg: "repeat(3, 1fr)",
      lgDown: "repeat(2,  1fr)",
      mdDown: "repeat(1,  1fr)",
    },
    entries: { lg: 1, lgDown: 1, mdDown: 1 },
    details: { lg: 2, lgDown: 1, mdDown: 1 },
  };

  return (
    <Flex direction="column" h="100%">
      <Flex justifyContent="end" mb="4" padding="4">
        <FormDrawer
          title="Add Entry"
          submitLabel="Add"
          formNode={
            <EntryForm
              members={selectedGroup!.members}
              entryParams={{
                initialEntry: undefined,
                creatorMemberId: memberByUserId.get(userId)!.id,
                members: selectedGroup!.members,
                groupId: selectedGroup!.id,
                onSuccess: (entryId: string) => {
                  setSelectedEntryId(entryId);
                },
              }}
            />
          }
        >
          <Button>Add Entry</Button>
        </FormDrawer>
      </Flex>
      <Grid
        templateColumns={gridSizes.top}
        gap="2"
        flex="1"
        h="100%"
        borderTop="1px solid"
        borderTopColor="fg.subtle"
      >
        <GridItem colSpan={gridSizes.entries}>
          <Listbox.Root
            height="100%"
            flex="1"
            borderRight={{ base: "1px solid", smDown: "none" }}
            borderRightColor="fg.subtle"
            collection={collection}
            value={selectedEntryId ? [selectedEntryId] : undefined}
            onValueChange={(v) => handleEntryChange(v.value[0])}
          >
            <Listbox.Content minHeight="100%">
              {collection.items.map((entry) => (
                <Listbox.Item
                  asChild
                  key={entry.value}
                  item={entry}
                  highlightOnHover
                  maxHeight="6em"
                >
                  <SimpleGrid
                    columns={6}
                    gap="2"
                    alignItems="center"
                    width="full"
                  >
                    <GridItem colSpan={1}>
                      <Avatar.Root
                        colorPalette={colorFromUuid(
                          memberById.get(entry.member_id)!.user_id ??
                            entry.member_id,
                        )}
                      >
                        <Avatar.Fallback
                          name={memberById.get(entry.member_id)!.name}
                        />
                      </Avatar.Root>
                    </GridItem>
                    <GridItem colSpan={3} justifyContent="start">
                      <VStack alignItems="start">
                        <Listbox.ItemText width="full">
                          <Text truncate title={entry.title}>
                            {entry.title}
                          </Text>
                        </Listbox.ItemText>
                        <Text fontSize="xs" color="fg.muted" mt="1">
                          {formatDate(entry.date, "dd/MM/yyyy")}
                        </Text>
                      </VStack>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <VStack alignItems="end">
                        <LocaleProvider locale="pt-br">
                          <FormatNumber
                            style="currency"
                            currency="BRL"
                            value={entry.amount as number}
                          />
                        </LocaleProvider>
                      </VStack>
                    </GridItem>
                  </SimpleGrid>
                </Listbox.Item>
              ))}
            </Listbox.Content>
          </Listbox.Root>
        </GridItem>
        <GridItem
          colSpan={gridSizes.details}
          p="4"
          bg={{ smDown: "bg.emphasized" }}
          borderTopRadius={{ smDown: "20px" }}
        >
          {selEntry && (
            <Flex justifyContent="space-between" width="full">
              <VStack alignItems="start">
                <Heading>{selEntry!.description}</Heading>
                <Text fontSize="sm" color="fg.muted">
                  {formatDate(selEntry!.date, "dd/MM/yyyy")}
                </Text>
              </VStack>
              <VStack alignItems="end">
                <FormDrawer
                  formNode={
                    <EntryForm
                      members={selectedGroup!.members}
                      entryParams={{
                        initialEntry: selEntry,
                        members: selectedGroup!.members,
                        creatorMemberId: selEntry.member_id,
                        groupId: selEntry.group_id,
                        onSuccess: (entryId: string) => {
                          setSelectedEntryId(entryId);
                        },
                      }}
                    />
                  }
                  title="Edit Entry"
                  submitLabel="Save"
                >
                  <IconButton size="2xs" variant="ghost">
                    <BiEditAlt />
                  </IconButton>
                </FormDrawer>
                <HStack>
                  <Avatar.Root
                    size="2xs"
                    colorPalette={colorFromUuid(
                      memberById.get(selEntry.member_id)!.user_id ??
                        selEntry.member_id,
                    )}
                  >
                    <Avatar.Fallback
                      name={memberById.get(selEntry.member_id)!.name}
                    />
                  </Avatar.Root>
                  <Text fontSize="sm">paid</Text>

                  <LocaleProvider locale="pt-br">
                    <FormatNumber
                      style="currency"
                      currency="BRL"
                      value={selEntry.amount as number}
                    />
                  </LocaleProvider>
                </HStack>
              </VStack>
            </Flex>
          )}
        </GridItem>
      </Grid>
    </Flex>
  );
}
