import {
  Avatar,
  Box,
  Button,
  Code,
  Dialog,
  Field,
  Flex,
  Group,
  HStack,
  IconButton,
  Input,
  Portal,
  Stack,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import type { FormHandle } from "@/components/FormDrawer";
import { useGroupSplit } from "./useGroupSplit";
import { useNavigate } from "react-router";
import { BiTrash } from "react-icons/bi";
import ProfileSelectSearch from "@/components/ProfileSelectSearch";
import type { Profile } from "@/api/profile.api";
import { CgClose } from "react-icons/cg";

interface GroupFormProps {
  group_id: string | null;
  onUpdateLoading?: (val: boolean) => void;
  closeDrawer?: () => void;
}

const GroupForm = forwardRef((props: GroupFormProps, ref: Ref<FormHandle>) => {
  const {
    createGroup,
    updateGroup,
    deleteGroup,
    loadingGroupCreateUpdateDelete,
    selectedGroup,
    upsertUserMembers,
  } = useGroupSplit();
  const [name, setName] = useState<string>(
    props.group_id ? selectedGroup!.name : "",
  );
  const [userMembers, setUserMembers] = useState<
    { user_id: string; name: string }[]
  >([]);
  const [virtMemberInput, setVirtMemberInput] = useState<string>("");
  const [virtMembers, setVirtMembers] = useState<
    { user_id: null; name: string }[]
  >([]);
  const navigate = useNavigate();
  const [deleteGroupNameConfirm, setDeleteGroupNameConfirm] =
    useState<string>("");
  const [deletePending, setDeletePending] = useState<boolean>(false);
  const deleteDialog = useDialog();

  const handleSubmit = async () => {
    if (props.group_id == null) {
      // new group
      props.onUpdateLoading?.(true);
      const id = await createGroup(name.trim());
      const members = [...userMembers, ...virtMembers];
      if (members.length > 0) {
        await upsertUserMembers(id, members);
      }
      props.onUpdateLoading?.(false);
      if (id) {
        navigate(`/group-split/${id}`);
      }
    } else {
      // update group
      props.onUpdateLoading?.(true);
      await updateGroup(props.group_id, { name: name.trim() });
      const members = [...userMembers, ...virtMembers];
      if (members.length > 0) {
        await upsertUserMembers(null, members);
      }
      props.onUpdateLoading?.(false);
    }
  };

  const handleGroupDelete = async () => {
    if (deleteGroupNameConfirm === selectedGroup!.name) {
      setDeletePending(true);
      await deleteGroup(props.group_id!);
      setDeletePending(false);
      deleteDialog.setOpen(false);
    } else {
      console.log("no match", deleteGroupNameConfirm, selectedGroup?.name);
    }
  };
  const handleAddVirtualMember = () => {
    if (virtMembers.find((v) => v.name == virtMemberInput) == null) {
      setVirtMembers((v) => [...v, { user_id: null, name: virtMemberInput }]);
      setVirtMemberInput("");
    }
  };

  const handleRemoveVirtualMember = (name: string) => {
    setVirtMembers(virtMembers.filter((v) => v.name != name));
  };

  useImperativeHandle(ref, () => ({
    triggerSubmit: handleSubmit,
  }));

  useEffect(() => {
    const initializeVirtMembers = async () => {
      if (props.group_id != null) {
        const vm: { user_id: null; name: string }[] =
          selectedGroup!.members
            .filter((m) => m.user_id == null)
            .map((m) => ({ user_id: null, name: m.name })) ?? [];
        setVirtMembers(vm);
      }
    };
    initializeVirtMembers();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [selectedGroup]);

  if (props.group_id != null) {
    // edit group
    const memberUserIds = selectedGroup!.members
      .filter((m) => m.user_id != null)
      .map((m) => m.user_id!);
    return (
      <>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Flex justifyContent="end">
              <IconButton variant="ghost" color="red.emphasized">
                <BiTrash />
              </IconButton>
            </Flex>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete Group?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Stack gap="4">
                    <Text color="gray">
                      Confirm you want to delete the group{" "}
                      <Code>{selectedGroup?.name}</Code>
                      by typing its name
                    </Text>
                    <Field.Root>
                      <Field.Label>Confirm group name</Field.Label>
                      <Input
                        type="text"
                        value={deleteGroupNameConfirm}
                        onChange={(e) =>
                          setDeleteGroupNameConfirm(e.target.value)
                        }
                      />
                    </Field.Root>
                  </Stack>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    loading={deletePending}
                    variant="outline"
                    color="red.solid"
                    onClick={handleGroupDelete}
                  >
                    Delete
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
        <VStack align="start" gap="8">
          <Field.Root disabled={loadingGroupCreateUpdateDelete}>
            <Field.Label>Name</Field.Label>
            <Input
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </Field.Root>
          <ProfileSelectSearch
            initialIds={memberUserIds}
            onValueChange={(p: Profile[]) => {
              const members = p.map((p) => ({
                user_id: p.id,
                name: p.full_name,
              }));
              setUserMembers(members);
            }}
          />
          <VStack align="start" gap="2" width="100%">
            <Field.Root
              disabled={loadingGroupCreateUpdateDelete}
              invalid={!!virtMembers.find((v) => v.name == virtMemberInput)}
            >
              <Field.Label>Virtual Members</Field.Label>
              <Group attached w="full">
                <Input
                  type="text"
                  minLength={3}
                  onChange={(e) => setVirtMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddVirtualMember();
                    }
                  }}
                  value={virtMemberInput}
                />
                <Button
                  onClick={() => handleAddVirtualMember()}
                  variant="outline"
                >
                  Add
                </Button>
              </Group>
            </Field.Root>
            {virtMembers.map((v) => (
              <Box
                key={v.name}
                bg="gray.subtle"
                p="2"
                width="100%"
                border="1px solid"
                borderColor="gray.border"
                borderRadius="4px"
              >
                <HStack gap="4">
                  <Avatar.Root>
                    <Avatar.Fallback name={v.name} />
                  </Avatar.Root>
                  <Text marginEnd="auto">{v.name}</Text>
                  <IconButton
                    variant="ghost"
                    color="red.muted"
                    onClick={() => handleRemoveVirtualMember(v.name)}
                    _hover={{ color: "red.solid" }}
                  >
                    <CgClose />
                  </IconButton>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </>
    );
  }

  return (
    <>
      <VStack align="start" gap="8">
        <Field.Root disabled={loadingGroupCreateUpdateDelete}>
          <Field.Label>Name</Field.Label>
          <Input
            type="text"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </Field.Root>
        <ProfileSelectSearch
          initialIds={[]}
          onValueChange={(p: Profile[]) => {
            const members = p.map((p) => ({
              user_id: p.id,
              name: p.full_name,
            }));
            setUserMembers(members);
          }}
        />
        <VStack align="start" gap="2" width="100%">
          <Field.Root
            disabled={loadingGroupCreateUpdateDelete}
            invalid={!!virtMembers.find((v) => v.name == virtMemberInput)}
          >
            <Field.Label>Virtual Members</Field.Label>
            <Group attached w="full">
              <Input
                type="text"
                minLength={3}
                onChange={(e) => setVirtMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddVirtualMember();
                  }
                }}
                value={virtMemberInput}
              />
              <Button
                onClick={() => handleAddVirtualMember()}
                variant="outline"
              >
                Add
              </Button>
            </Group>
          </Field.Root>
          {virtMembers.map((v) => (
            <Box
              key={v.name}
              bg="gray.subtle"
              p="2"
              width="100%"
              border="1px solid"
              borderColor="gray.border"
              borderRadius="4px"
            >
              <HStack gap="4">
                <Avatar.Root>
                  <Avatar.Fallback name={v.name} />
                </Avatar.Root>
                <Text marginEnd="auto">{v.name}</Text>
                <IconButton
                  variant="ghost"
                  color="red.muted"
                  onClick={() => handleRemoveVirtualMember(v.name)}
                  _hover={{ color: "red.solid" }}
                >
                  <CgClose />
                </IconButton>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </>
  );
});

export default GroupForm;
