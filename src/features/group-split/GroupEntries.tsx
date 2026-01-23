import { useGroupSplit } from "./useGroupSplit";
import { useMemo, useState } from "react";
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
  const {
    entries,
    setEntries,
    loading: loadingEntries,
  } = useEntries(selectedGroup!.id);
  const [selectedEntry, setSelectedEntry] = useState<Entry | undefined>(
    undefined,
  );

  const memberById = useMemo(() => {
    return new Map(selectedGroup?.members.map((m) => [m.id, m]));
  }, [selectedGroup]);

  const memberByUserId = useMemo(() => {
    return new Map(
      selectedGroup?.members
        .filter((m) => m.user_id != null)
        .map((m) => [m.user_id, m]),
    );
  }, [selectedGroup]);

  if (loadingGroup || loadingEntries) {
    return (
      <>
        <p>loading</p>
      </>
    );
  }

  const handleEntryChange = (entryId: string) => {
    const entry = entries.find((e) => e.id == entryId);
    setSelectedEntry(entry);
  };

  const collection = createListCollection({
    items: entries.map((entry) => ({
      value: entry.id,
      title: entry.description,
      member_id: entry.member_id,
      date: entry.date,
      amount: entry.amount,
    })),
  });

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
    <>
      <Flex justifyContent="end" mb="4">
        <FormDrawer
          title="Add Entry"
          submitLabel="Add"
          formNode={
            <EntryForm
              members={selectedGroup!.members}
              entryParams={{
                initialEntry: undefined,
                creatorMemberId: memberByUserId.get(userId)!.id,
                groupId: selectedGroup!.id,
                onSuccess: (entry: Entry) => {
                  setEntries((e) => [...e, entry]);
                  setSelectedEntry(entry);
                },
              }}
            />
          }
        >
          <Button>Add Entry</Button>
        </FormDrawer>
      </Flex>
      <Grid templateColumns={gridSizes.top} gap="2">
        <GridItem colSpan={gridSizes.entries}>
          <Listbox.Root
            flex="1"
            collection={collection}
            onValueChange={(v) => handleEntryChange(v.value[0])}
          >
            <Listbox.Content>
              {collection.items.map((entry) => (
                <Listbox.Item key={entry.value} item={entry}>
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
        <GridItem colSpan={gridSizes.details} p="4">
          {selectedEntry && (
            <Flex justifyContent="space-between" width="full">
              <VStack alignItems="start">
                <Heading>{selectedEntry!.description}</Heading>
                <Text fontSize="sm" color="fg.muted">
                  {formatDate(selectedEntry!.date, "dd/MM/yyyy")}
                </Text>
              </VStack>
              <VStack alignItems="end">
                <FormDrawer
                  formNode={
                    <EntryForm
                      members={selectedGroup!.members}
                      entryParams={{
                        initialEntry: selectedEntry,
                        creatorMemberId: selectedEntry.member_id,
                        groupId: selectedEntry.group_id,
                        onSuccess: (entry: Entry) => {
                          setEntries((prev) =>
                            prev.map((item) =>
                              item.id == entry.id
                                ? { ...item, ...entry }
                                : item,
                            ),
                          );
                          if (selectedEntry.id === entry.id) {
                            setSelectedEntry(entry);
                          }
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
                      memberById.get(selectedEntry.member_id)!.user_id ??
                        selectedEntry.member_id,
                    )}
                  >
                    <Avatar.Fallback
                      name={memberById.get(selectedEntry.member_id)!.name}
                    />
                  </Avatar.Root>

                  <LocaleProvider locale="pt-br">
                    <FormatNumber
                      style="currency"
                      currency="BRL"
                      value={selectedEntry.amount as number}
                    />
                  </LocaleProvider>
                </HStack>
              </VStack>
            </Flex>
          )}
        </GridItem>
      </Grid>
    </>
  );
}
