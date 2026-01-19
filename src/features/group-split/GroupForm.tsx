import {
  Button,
  Code,
  Dialog,
  Field,
  Flex,
  IconButton,
  Input,
  Portal,
  Stack,
  Text,
  useDialog,
} from "@chakra-ui/react";
import { forwardRef, useImperativeHandle, useState, type Ref } from "react";
import type { FormHandle } from "@/components/FormDrawer";
import { useGroupSplit } from "./useGroupSplit";
import { useNavigate } from "react-router";
import { BiTrash } from "react-icons/bi";

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
  } = useGroupSplit();
  const [name, setName] = useState<string>(
    props.group_id ? selectedGroup!.name : "",
  );
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
      props.onUpdateLoading?.(false);
      if (id) {
        navigate(`/group-split/${id}`);
      }
    } else {
      // update group
      props.onUpdateLoading?.(true);
      await updateGroup(props.group_id, { name: name.trim() });
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

  useImperativeHandle(ref, () => ({
    triggerSubmit: handleSubmit,
  }));

  if (props.group_id != null) {
    // edit group
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
        <Field.Root disabled={loadingGroupCreateUpdateDelete}>
          <Field.Label>Name</Field.Label>
          <Input
            type="text"
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </Field.Root>
      </>
    );
  }

  return (
    <>
      <Field.Root disabled={loadingGroupCreateUpdateDelete}>
        <Field.Label>Name</Field.Label>
        <Input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
      </Field.Root>
    </>
  );
});

export default GroupForm;
